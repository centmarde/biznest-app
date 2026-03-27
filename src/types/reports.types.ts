export interface TableRow {
  label?: string
  businessOwner?: string
  contactNumber?: string
  businessLocation?: string
  zoningClassification?: string
  geotag?: string
}

export interface Tab {
  label: string
  content: string
  tableData?: TableRow[]
}