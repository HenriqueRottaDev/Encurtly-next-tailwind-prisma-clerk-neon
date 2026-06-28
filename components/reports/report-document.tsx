import {
  Document, Page, Text, View, StyleSheet, Font,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 48,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 32,
    borderBottom: '2px solid #7C3AED',
    paddingBottom: 16,
  },
  brand: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#7C3AED',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: '#1e1b4b',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  meta: {
    fontSize: 9,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1e1b4b',
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statBox: {
    backgroundColor: '#f5f3ff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#7C3AED',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  table: {
    borderRadius: 4,
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#7C3AED',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottom: '1px solid #f3f4f6',
  },
  tableRowAlt: {
    backgroundColor: '#faf5ff',
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
    flex: 1,
  },
  bar: {
    height: 6,
    backgroundColor: '#7C3AED',
    borderRadius: 3,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 48,
    right: 48,
    borderTop: '1px solid #e5e7eb',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
})

interface ReportData {
  totalClicks: number
  topLinks: { slug: string; title: string | null; clicks: number }[]
  allLinks: { slug: string; title: string | null; clicks: number }[]
  byCountry: { label: string; count: number }[]
  byDevice: { label: string; count: number }[]
  byReferrer: { label: string; count: number }[]
}

interface ReportDocumentProps {
  title: string
  days: number
  data: ReportData
  generatedAt: string
}

export function ReportDocument({ title, days, data, generatedAt}: ReportDocumentProps) {
  const date = new Date(generatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const maxClicks = Math.max(...data.topLinks.map((l) => l.clicks), 1)

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>Encurtly</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.meta}>Período: últimos {days} dias · Gerado em {date}</Text>
        </View>

        {/* Total de cliques */}
        <View style={styles.statBox}>
          <View>
            <Text style={styles.statValue}>{data.totalClicks.toLocaleString('pt-BR')}</Text>
            <Text style={styles.statLabel}>cliques totais no período</Text>
          </View>
        </View>

        {/* Top Links */}
        {data.topLinks.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Top Links</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Slug</Text>
                <Text style={[styles.tableHeaderText, { flex: 3 }]}>Título</Text>
                <Text style={styles.tableHeaderText}>Cliques</Text>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Participação</Text>
              </View>
              {data.topLinks.map((link, i) => (
                <View key={link.slug} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.tableCell, { flex: 2, color: '#7C3AED' }]}>/{link.slug}</Text>
                  <Text style={[styles.tableCell, { flex: 3 }]}>{link.title ?? '—'}</Text>
                  <Text style={styles.tableCell}>{link.clicks}</Text>
                  <View style={[styles.tableCell, { flex: 2, justifyContent: 'center' }]}>
                    <View style={[styles.bar, { width: `${(link.clicks / maxClicks) * 100}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Todos os links */}
        {data.allLinks.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Todos os links ({data.allLinks.length})</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Slug</Text>
                <Text style={[styles.tableHeaderText, { flex: 3 }]}>Título</Text>
                <Text style={styles.tableHeaderText}>Cliques</Text>
              </View>
              {data.allLinks.map((link, i) => (
                <View key={link.slug} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.tableCell, { flex: 2, color: '#7C3AED' }]}>/{link.slug}</Text>
                  <Text style={[styles.tableCell, { flex: 3 }]}>{link.title ?? '—'}</Text>
                  <Text style={styles.tableCell}>{link.clicks}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Países + Dispositivos lado a lado */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
          {/* Países */}
          {data.byCountry.length > 0 && (
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Países</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>País</Text>
                  <Text style={styles.tableHeaderText}>Cliques</Text>
                </View>
                {data.byCountry.slice(0, 8).map((c, i) => (
                  <View key={c.label} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                    <Text style={styles.tableCell}>{c.label}</Text>
                    <Text style={styles.tableCell}>{c.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Dispositivos */}
          {data.byDevice.length > 0 && (
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Dispositivos</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>Dispositivo</Text>
                  <Text style={styles.tableHeaderText}>Cliques</Text>
                </View>
                {data.byDevice.map((d, i) => (
                  <View key={d.label} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                    <Text style={styles.tableCell}>{d.label}</Text>
                    <Text style={styles.tableCell}>{d.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Referrers */}
        {data.byReferrer.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Fontes de tráfego</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 3 }]}>Referrer</Text>
                <Text style={styles.tableHeaderText}>Cliques</Text>
              </View>
              {data.byReferrer.slice(0, 8).map((r, i) => (
                <View key={r.label} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.tableCell, { flex: 3 }]}>{r.label}</Text>
                  <Text style={styles.tableCell}>{r.count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Encurtly — Links inteligentes</Text>
          <Text style={styles.footerText}>encurtly.com.br</Text>
        </View>

      </Page>
    </Document>
  )
}