export const prerender = false;

export async function GET() {
  try {
    const response = await fetch('https://solved.ac/api/v3/user/show?handle=charlie1126');
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
