<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useReports } from '../composables/useReports';
import { usePdfExport } from '../composables/usePdfExport';
import { TypographyP } from '@/components/typography';
import ReportsHeader from './ReportsHeader.vue';
import TabButtons from './TabandExportButtons.vue';
import ReportTable from './ReportTable.vue';

const { value, tabs, loading, error, handleChange, fetchReports } = useReports();
const { exportToPdf } = usePdfExport();

const currentTab = computed(() => tabs.value[value.value]);
const canExport = computed(() => {
  return currentTab.value?.tableData ? currentTab.value.tableData.length > 0 : false;
});

const handleExport = () => {
  if (canExport.value && currentTab.value) {
    exportToPdf(currentTab.value, currentTab.value.label);
  }
};

onMounted(() => {
  fetchReports();
});
</script>

<template>
  <ReportsHeader :loading="loading" :error="error">
    <div v-if="!loading && !error">
      <TabButtons :tabs="tabs" :value="value" :canExport="canExport" @change="handleChange" @export="handleExport" />
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        role="tabpanel"
        :hidden="value !== index"
        :id="`simple-tabpanel-${index}`"
        :aria-labelledby="`simple-tab-${index}`"
        class="block [[hidden]]:hidden"
      >
        <ReportTable v-if="value === index" :table-data="tab.tableData" :content="tab.content" />
      </div>
    </div>
    </ReportsHeader>
</template>