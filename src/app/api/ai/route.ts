import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message manquant' }, { status: 400 });
    }

    const zai = await getZAI();

    const systemPrompt = `Tu es un assistant pédagogique haïtien spécialisé dans la préparation au concours d'entrée de la Faculté des Sciences d'Haïti.

Tu aides les étudiants en :
- Mathématiques (algèbre, géométrie, trigonométrie, analyse, probabilités)
- Physique (mécanique, électricité, thermodynamique)
- Chimie (atomistique, chimie organique, solutions, réactions chimiques)
- Optique (réflexion, réfraction, lentilles)
- Culture générale (histoire d'Haïti, géographie, actualités)

Règles :
1. Réponds TOUJOURS en français
2. Explique de façon simple et claire
3. Utilise des exemples concrets quand c'est possible
4. Si on te demande de générer un exercice, crée un exercice pertinent avec sa solution détaillée
5. Si l'étudiant a fait une erreur, explique-la patiemment
6. Adapte ton niveau de langage à un étudiant de niveau secondaire
7. Sois encourageant et motivant
${context ? `\nContexte actuel : ${context}` : ''}`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: message },
      ],
      thinking: { type: 'disabled' },
    });

    const reply = completion.choices?.[0]?.message?.content || 'Désolé, je n\'ai pas pu générer une réponse. Veuillez réessayer.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error with AI:', error);
    return NextResponse.json(
      { reply: 'Désolé, une erreur est survenue lors de la communication avec l\'assistant. Veuillez réessayer.' },
      { status: 200 }
    );
  }
}
