const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function createAssignment(formData: FormData) {
  const res = await fetch(`${BASE}/assignments`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to create');
  return res.json() as Promise<{ assignmentId: string }>;
}

export async function listAssignments() {
  const res = await fetch(`${BASE}/assignments`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function getAssignment(id: string) {
  const res = await fetch(`${BASE}/assignments/${id}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

export async function deleteAssignment(id: string) {
  await fetch(`${BASE}/assignments/${id}`, { method: 'DELETE' });
}
