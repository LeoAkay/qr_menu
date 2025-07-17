import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userName, password } = await request.json();

    // Validate input
    if (!userName || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user with role and company
    const user = await prisma.user.findUnique({
      where: { userName },
      include: {
        role: true,
        company: {
          select: {
            id: true,
            C_Name: true,
          },
        },
      },
    });

    // User not found or wrong password (plain text)
    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        userName: user.userName,
        roleId: user.roleId,
        roleName: user.role.roleName,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Build response data
    const userData = {
      id: user.id,
      userName: user.userName,
      role: {
        id: user.role.id,
        roleName: user.role.roleName,
      },
      company: user.company
        ? {
            id: user.company.id,
            C_Name: user.company.C_Name,
          }
        : null,
    };

    // Create response with token cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
