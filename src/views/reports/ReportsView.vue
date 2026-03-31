<script setup lang="ts">
import { useReports } from './composables/useReports';
import ReportsHeader from './components/ReportsHeader.vue';
import TabAndExportButtons from './components/TabAndExportButtons.vue';
import ReportTable from './components/ReportTable.vue';

// Initialize variables from composable (must be called inside <script setup>)
const { value, tabs, loading, error, canExport, handleTabChange, handleExport } = useReports();
</script>

<template>
  <ReportsHeader :loading="loading" :error="error">
    <div v-if="!loading && !error">
      <TabAndExportButtons :tabs="tabs" :value="value" :canExport="canExport" 
        @change="handleTabChange" 
        @export="handleExport" 
      />
      <div
        v-for="(tab, index) in tabs" :key="index" role="tabpanel" :hidden="value !== index" :id="`simple-tabpanel-${index}`"
        :aria-labelledby="`simple-tab-${index}`"
      >
        <ReportTable :table-data="tab.tableData" :content="tab.content" />
      </div>
    </div>
  </ReportsHeader>
</template>