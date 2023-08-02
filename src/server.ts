import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";

const app = fastify();
app.register(cors);

const prisma = new PrismaClient();

app.get("/patients", async () => {
  const patients = await prisma.patient.findMany();

  return { patients };
});

app.post("/patients", async (request, reply) => {
  const createPatientSchema = z.object({
    name: z.string(),
    birthDate: z.string(),
    cpf: z.string(),
    phone: z.string(),
  });

  const { name, birthDate, cpf, phone } = createPatientSchema.parse(
    request.body
  );

  const existingPatient = await prisma.patient.findUnique({ where: { cpf } });
  if (existingPatient) {
    return reply.status(409).send({ error: "CPF already in use" });
  }

  await prisma.patient.create({
    data: {
      name,
      birthDate,
      cpf,
      phone,
    },
  });

  return reply.status(201).send();
});

app
  .listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
  })
  .then(() => {
    console.log("HTTP Server Running");
  });

// id        String   @id @default(cuid())
// name      String
// birthDate DateTime
// cpf       String   @unique
// phone     String
// createdAt DateTime @default(now())
