export type ComplaintStatus = "Pending" | "Reviewed" | "Resolved";

export type Complaint = {
  id: string;
  createdAt: string;
  userId: string;
  location: string;
  type: string;
  name: string;
  rollNumber: string;
  email: string;
  mobile: string;
  description: string;
  knowsPerson: boolean;
  privacy: "Private" | "Anonymous";
  status: ComplaintStatus;
};

const STORAGE_KEY = "vnr_antirag_complaints";
const PROFILE_KEY = "vnr_antirag_profile";

function read(): Complaint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Complaint[]) : [];
  } catch {
    return [];
  }
}

function write(items: Complaint[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getCurrentUserId(): string {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return "guest";
  try {
    const p = JSON.parse(raw);
    return p?.userId || "guest";
  } catch {
    return "guest";
  }
}

export function upsertProfile(profile: { userId?: string; name?: string; email?: string; mobile?: string }) {
  const existing = getProfile();
  const next = { ...existing, ...profile };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  return next;
}

export function getProfile(): { userId: string; name?: string; email?: string; mobile?: string } {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { userId: "guest" };
    const parsed = JSON.parse(raw);
    return { userId: parsed.userId || "guest", name: parsed.name, email: parsed.email, mobile: parsed.mobile };
  } catch {
    return { userId: "guest" };
  }
}

export function addComplaint(data: Omit<Complaint, "id" | "createdAt" | "status" | "userId">) {
  const list = read();
  const id = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const userId = getCurrentUserId();
  const item: Complaint = {
    id,
    createdAt: new Date().toISOString(),
    userId,
    status: "Pending",
    ...data,
  };
  list.unshift(item);
  write(list);
  return item;
}

export function getComplaintsByUser(userId?: string) {
  const uid = userId || getCurrentUserId();
  return read().filter((c) => c.userId === uid);
}

export function updateComplaintStatus(id: string, status: ComplaintStatus) {
  const list = read();
  const idx = list.findIndex((c) => c.id === id);
  if (idx >= 0) {
    list[idx].status = status;
    write(list);
  }
}

export async function attemptSync(): Promise<{ synced: number }>{
  // TODO: Integrate Supabase for real sync. For now, no-op.
  const count = read().length;
  return { synced: count };
}
