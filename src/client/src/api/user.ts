export async function getUserByTgId(tg_id: number) {
  const res = await fetch(`/api/user/info?tg_id=${tg_id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function saveUser(payload: {
  tg_id: number;
  category: string;
  full_name?: string;
  email?: string;
}) {
  const res = await fetch(`/api/user/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.json();
}

export const updateUser = async (tgId: number, data: any) => {
  const response = await fetch(`/api/user/update?tg_id=${tgId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
};

export const sendSupportRequest = async (data: any) => {
  const response = await fetch('/api/user/support', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
};
