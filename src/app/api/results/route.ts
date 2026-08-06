import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    let student = await db.student.findFirst();
    if (!student) {
      return NextResponse.json({ answers: [], totalCompleted: 0 });
    }

    const answers = await db.studentAnswer.findMany({
      where: { studentId: student.id },
      include: { exercise: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const totalCompleted = await db.studentAnswer.count({
      where: { studentId: student.id },
    });

    return NextResponse.json({ answers, totalCompleted });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des résultats' },
      { status: 500 }
    );
  }
}
