import { prisma } from "../../lib/prisma";

export async function upsert(env: string, name: string, key: string, value: any) {
  const ns = await prisma.configNamespace.upsert({
    where: { name_env: { name, env } },
    create: { name, env },
    update: {},
  });
  return prisma.configItem.upsert({
    where: { namespaceId_key: { namespaceId: ns.id, key } },
    create: { namespaceId: ns.id, key, value },
    update: { value },
  });
}

export async function get(env: string, name: string) {
  const ns = await prisma.configNamespace.findUnique({
    where: { name_env: { name, env } },
    include: { items: true },
  });
  return ns?.items ?? [];
}
