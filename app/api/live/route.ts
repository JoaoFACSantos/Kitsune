import { getLiveStatus } from '@/lib/data';

// Estado do direto para o nav (o cliente pergunta de 60 em 60 s). Cache de 60 s.
export const revalidate = 60;

export async function GET() {
  return Response.json(await getLiveStatus());
}
