import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco...')

  // Clínica
  const clinica = await prisma.clinica.upsert({
    where: { id: 'clinica-01' },
    update: {},
    create: {
      id: 'clinica-01',
      nome: 'Clínica São Lucas',
      email: 'contato@saolucas.com',
      telefone: '(11) 99999-0000',
    },
  })
  console.log(`✅ Clínica: ${clinica.nome}`)

  // Admin
  const adminHash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@medstock.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@medstock.com',
      senhaHash: adminHash,
      role: 'ADMIN',
      clinicaId: clinica.id,
    },
  })

  // Farmacêutica
  const farmHash = await bcrypt.hash('farm123', 12)
  const farmaceutica = await prisma.usuario.upsert({
    where: { email: 'juliana@medstock.com' },
    update: {},
    create: {
      nome: 'Juliana Costa',
      email: 'juliana@medstock.com',
      senhaHash: farmHash,
      role: 'FARMACEUTICO',
      clinicaId: clinica.id,
    },
  })
  console.log(`✅ Usuários: ${admin.nome}, ${farmaceutica.nome}`)

  // Fornecedor
  const fornecedor = await prisma.fornecedor.upsert({
    where: { cnpj: '00.000.000/0001-00' },
    update: {},
    create: {
      nome: 'Farmacêutica Distribuidora Ltda',
      cnpj: '00.000.000/0001-00',
      email: 'vendas@distribuidora.com',
      telefone: '(11) 3000-0000',
    },
  })

  // Medicamentos de exemplo
  const medicamentos = [
    { nome: 'Amoxicilina 500mg', tipo: 'CAPSULA' as const, estoqueAtual: 28, estoqueMinimo: 50 },
    { nome: 'Dipirona 500mg', tipo: 'COMPRIMIDO' as const, estoqueAtual: 142, estoqueMinimo: 30 },
    { nome: 'Losartana 50mg', tipo: 'COMPRIMIDO' as const, estoqueAtual: 35, estoqueMinimo: 60 },
    { nome: 'Omeprazol 20mg', tipo: 'CAPSULA' as const, estoqueAtual: 87, estoqueMinimo: 20 },
    { nome: 'Paracetamol 750mg', tipo: 'COMPRIMIDO' as const, estoqueAtual: 5, estoqueMinimo: 50 },
  ]

  for (const med of medicamentos) {
    await prisma.medicamento.upsert({
      where: { id: `med-${med.nome.toLowerCase().replace(/\s/g, '-')}` },
      update: { estoqueAtual: med.estoqueAtual },
      create: {
        id: `med-${med.nome.toLowerCase().replace(/\s/g, '-')}`,
        ...med,
        clinicaId: clinica.id,
        fornecedorId: fornecedor.id,
      },
    })
  }
  console.log(`✅ ${medicamentos.length} medicamentos criados`)

  console.log('\n🎉 Seed concluído!')
  console.log('─────────────────────────────')
  console.log('Login Admin:        admin@medstock.com / admin123')
  console.log('Login Farmacêutica: juliana@medstock.com / farm123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
