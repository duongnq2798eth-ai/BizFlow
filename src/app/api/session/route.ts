import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userToken, userId } = await request.json();

    if (!userToken) {
      return NextResponse.json(
        { error: "userToken is required" },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Session cookie saved successfully (XSS protected)",
      userId: userId || "mock-user-123"
    });

    // In production, set httpOnly, secure, sameSite cookies to block third-party access (XSS mitigation)
    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("bizflow_user_token", userToken, {
      httpOnly: true,
      secure: isProd, // True in production (requires HTTPS)
      sameSite: "strict", // MITIGATES CSRF & XSS sharing
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/"
    });

    if (userId) {
      response.cookies.set("bizflow_user_id", userId, {
        httpOnly: false, // Accessible to client for UI states
        secure: isProd,
        sameSite: "strict",
        maxAge: 60 * 60 * 2,
        path: "/"
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to establish secure session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const userToken = request.cookies.get("bizflow_user_token")?.value;
  const userId = request.cookies.get("bizflow_user_id")?.value;

  if (!userToken) {
    return NextResponse.json(
      { error: "No active session found", authenticated: false },
      { status: 401 }
    );
  }

  // Mask the token in the API response to demonstrate that it is stored on the server
  const maskedToken = userToken.length > 8 
    ? `${userToken.substring(0, 4)}...${userToken.substring(userToken.length - 4)}` 
    : userToken;

  return NextResponse.json({
    authenticated: true,
    userId: userId || "unknown",
    userTokenMasked: maskedToken,
    storageMethod: "httpOnly Cookie (Security Level: High)"
  });
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: "Session deleted successfully"
  });

  response.cookies.set("bizflow_user_token", "", {
    maxAge: 0,
    path: "/"
  });

  response.cookies.set("bizflow_user_id", "", {
    maxAge: 0,
    path: "/"
  });

  return response;
}
