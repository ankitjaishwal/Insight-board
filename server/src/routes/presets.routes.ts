import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router = Router();

const createPresetSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1),
  filters: z.unknown(),
  createdAt: z.number().int().positive().optional(),
});

const updatePresetSchema = z.object({
  name: z.string().trim().min(1),
  filters: z.unknown(),
  createdAt: z.number().int().positive().optional(),
});

function toClientPreset(preset: {
  id: string;
  name: string;
  filters: string;
  createdAt: Date;
}) {
  return {
    id: preset.id,
    name: preset.name,
    filters: JSON.parse(preset.filters),
    createdAt: preset.createdAt.getTime(),
  };
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const presets = await prisma.filterPreset.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    return res.json(presets.map(toClientPreset));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch presets" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsed = createPresetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    const { id, name, filters, createdAt } = parsed.data;

    const preset = await prisma.filterPreset.create({
      data: {
        ...(id ? { id } : {}),
        name,
        filters: JSON.stringify(filters),
        userId,
        ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
      },
    });

    return res.status(201).json(toClientPreset(preset));
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "Preset already exists" });
    }

    console.error(err);
    return res.status(500).json({ error: "Failed to create preset" });
  }
});

router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsed = updatePresetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    const presetId = String(req.params.id);
    const existing = await prisma.filterPreset.findUnique({
      where: { id: presetId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Preset not found" });
    }

    if (existing.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { name, filters, createdAt } = parsed.data;
    const updated = await prisma.filterPreset.update({
      where: { id: presetId },
      data: {
        name,
        filters: JSON.stringify(filters),
        ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
      },
    });

    return res.json(toClientPreset(updated));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update preset" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const presetId = String(req.params.id);
    const existing = await prisma.filterPreset.findUnique({
      where: { id: presetId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Preset not found" });
    }

    if (existing.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.filterPreset.delete({
      where: { id: presetId },
    });

    return res.json({ id: presetId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete preset" });
  }
});

export default router;
