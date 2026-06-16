import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPacientes, searchPacientes, createPaciente, createHistoriaClinica, getPacienteByDni } from "@/lib/db";
import { WizardData } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const q = new URL(req.url).searchParams.get("q") ?? "";
    const pacientes = q ? await searchPacientes(q) : await getPacientes();
    return NextResponse.json(pacientes);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener pacientes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body: WizardData = await req.json();

    const existente = await getPacienteByDni(body.paso1.dni);
    if (existente) {
      return NextResponse.json({ error: "duplicate_dni", pacienteId: existente.id }, { status: 409 });
    }

    const paciente = await createPaciente({
      dni: body.paso1.dni,
      nombre: body.paso1.nombre,
      apellidos: body.paso1.apellidos,
      email: body.paso1.email,
      telefono: body.paso1.telefono,
      fechaNacimiento: body.paso1.fechaNacimiento,
      poblacion: body.paso1.poblacion,
      lopdFirmada: body.paso1.lopdFirmada ?? false,
    });
    await createHistoriaClinica({
      pacienteId: paciente.id,
      profesion: body.paso2.profesion,
      alergias: body.paso2.alergias,
      ejercicioFisico: body.paso2.ejercicioFisico,
      motivoConsulta: body.paso3.motivoConsulta,
      antecedentesPersonalesFamiliares: body.paso4.antecedentesPersonalesFamiliares,
      calidadSueno: body.paso4.calidadSueno,
      patologias: body.paso4.patologias,
      tabaquismo: body.paso4.tabaquismo,
      medicacion: body.paso4.medicacion,
      implantesMetalicos: body.paso4.implantesMetalicos,
      embarazoLactancia: body.paso4.embarazoLactancia,
      semanasEmbarazo: body.paso4.semanasEmbarazo,
      banderasRojas: body.paso5.banderasRojas,
      pruebaTipo: body.paso5.pruebaTipo,
      pruebaFecha: body.paso5.pruebaFecha,
      pruebaDiagnostico: body.paso5.pruebaDiagnostico,
      fechaCreacion: new Date().toISOString(),
    });
    return NextResponse.json(paciente, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear paciente" }, { status: 500 });
  }
}
