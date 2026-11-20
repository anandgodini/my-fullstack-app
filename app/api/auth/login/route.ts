import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/prisma";
import { loginSchema } from "@/src/lib/validations/auth";
import { createSessionToken } from "@/src/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Server-side validation
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = parsed.data;

    // 2. Retrieve user from PostgreSQL using Prisma
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // 3. Verify password hash using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // 4. Secure Session Management (30 days for Remember Me, else 24 hours)
    const durationSeconds = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
    const token = createSessionToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      durationSeconds
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    );

    // 5. Set HTTP-only secure cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: durationSeconds,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
