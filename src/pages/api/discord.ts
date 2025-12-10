export const prerender = false;

export async function GET() {
  try {
    const response = await fetch('https://api.lanyard.rest/v1/users/719063773389914219');
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Failed to fetch' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
