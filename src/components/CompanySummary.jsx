import SituacaoBadge from './SituacaoBadge'
import {
  formatCNPJ,
  formatCEP,
  formatPhone,
  formatDate,
  formatCurrency,
} from '../utils/formatters'

function InfoItem({ label, value, mono = false }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={`mt-0.5 text-sm text-slate-800 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 pb-1 border-b border-slate-100">
        {title}
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </dl>
    </div>
  )
}

export default function CompanySummary({ data }) {
  if (!data) return null

  const cnae = data.cnae_fiscal_descricao
    ? `${data.cnae_fiscal} — ${data.cnae_fiscal_descricao}`
    : data.cnae_fiscal

  const endereco = [
    data.logradouro && `${data.descricao_tipo_de_logradouro || ''} ${data.logradouro}`.trim(),
    data.numero && `Nº ${data.numero}`,
    data.complemento,
    data.bairro,
  ].filter(Boolean).join(', ')

  const cidadeUF = [data.municipio, data.uf].filter(Boolean).join(' / ')

  const telefone = data.ddd_telefone_1
    ? formatPhone(`${data.ddd_telefone_1}`)
    : null

  const inscricoesEstaduais = data.inscricoes_estaduais?.length
    ? data.inscricoes_estaduais.map(i => `${i.inscricao_estadual} (${i.estado || i.uf || ''})`).join(' · ')
    : null

  // Try to get situação from multiple possible fields
  const situacao =
    data.descricao_situacao_cadastral ||
    data.situacao_cadastral ||
    data.situacao ||
    null

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Empresa encontrada</p>
            <h2 className="text-xl font-bold leading-tight">{data.razao_social || '—'}</h2>
            {data.nome_fantasia && data.nome_fantasia !== data.razao_social && (
              <p className="text-blue-200 text-sm mt-1">{data.nome_fantasia}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {situacao && <SituacaoBadge situacao={situacao} />}
            {data.cnpj && (
              <span className="font-mono text-sm bg-blue-800/40 px-2.5 py-1 rounded-lg text-blue-100">
                {formatCNPJ(data.cnpj)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        <Section title="Identificação">
          <InfoItem label="Razão Social" value={data.razao_social} />
          <InfoItem label="Nome Fantasia" value={data.nome_fantasia} />
          <InfoItem label="CNPJ" value={data.cnpj ? formatCNPJ(data.cnpj) : null} mono />
          <InfoItem label="Data de Abertura" value={formatDate(data.data_inicio_atividade)} />
          <InfoItem label="Natureza Jurídica" value={
            data.descricao_natureza_juridica || data.natureza_juridica
          } />
          <InfoItem label="Porte" value={data.descricao_porte || data.porte} />
          <InfoItem
            label="Capital Social"
            value={data.capital_social != null ? formatCurrency(data.capital_social) : null}
          />
        </Section>

        <Section title="Atividade">
          <InfoItem label="CNAE Principal" value={cnae} />
          {data.cnaes_secundarios?.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">CNAEs Secundários</dt>
              <dd className="space-y-1">
                {data.cnaes_secundarios.map((c, i) => (
                  <div key={i} className="text-sm text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg">
                    {c.codigo} — {c.descricao}
                  </div>
                ))}
              </dd>
            </div>
          )}
        </Section>

        <Section title="Contato">
          <InfoItem label="Telefone" value={telefone} />
          {data.ddd_telefone_2 && (
            <InfoItem label="Telefone 2" value={formatPhone(`${data.ddd_telefone_2}`)} />
          )}
          <InfoItem label="E-mail" value={data.email} />
        </Section>

        <Section title="Endereço">
          <div className="sm:col-span-2">
            <InfoItem label="Logradouro" value={endereco} />
          </div>
          <InfoItem label="Cidade / UF" value={cidadeUF} />
          <InfoItem label="CEP" value={data.cep ? formatCEP(data.cep) : null} mono />
        </Section>

        {inscricoesEstaduais && (
          <Section title="Inscrições Estaduais">
            <div className="sm:col-span-2">
              <InfoItem label="Inscrições" value={inscricoesEstaduais} />
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}
