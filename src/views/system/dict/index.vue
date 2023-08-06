<script setup lang="ts">
import { ref } from "vue";
import { useType } from "./indexHook";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import addUpdate from "./addUpdate.vue";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineOptions({
  name: "dict-type"
});

const formRef = ref();
const {
  selectData,
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  handleAdd,
  handleUpdate,
  handleDelete,
  handleSizeChange,
  handleCurrentChange,
  dialogVisible,
  dialogTitle,
  editId
} = useType();
</script>

<template>
  <div class="main">
    <el-form ref="formRef" :inline="true" :model="form" class="w-[99/100] pl-4">
      <el-form-item label="对照字段：" prop="field">
        <el-select v-model="form.field" placeholder="请选择字典名称" clearable>
          <el-option
            v-for="item in selectData"
            :key="item.value"
            :label="item.fieldName"
            :value="item.field"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="onSearch"
        >
          {{ t("addUpdate.search") }}
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          {{ t("addUpdate.reset") }}
        </el-button>
      </el-form-item>
    </el-form>

    <TableBar @refresh="onSearch">
      <template #buttons>
        <el-button type="primary" icon="Plus" @click="handleAdd">
          {{ t("addUpdate.add1") }}
        </el-button>
      </template>
      <template v-slot="{ size, checkList }">
        <ReTable
          border
          align-whole="center"
          table-layout="auto"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="columns"
          :checkList="checkList"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <div v-if="row.userType != '3'">
              <el-button
                class="reset-margin"
                link
                type="info"
                :size="size"
                @click="handleUpdate(row)"
                :icon="useRenderIcon(EditPen)"
              >
                <span class="text-xs">
                  {{ t("addUpdate.edit1") }}
                </span>
              </el-button>
              <el-button
                class="reset-margin"
                link
                type="danger"
                :size="size"
                :icon="useRenderIcon(Delete)"
                @click="handleDelete(row)"
              >
                <span class="text-xs">
                  {{ t("addUpdate.delete") }}
                </span>
              </el-button>
            </div>
          </template>
        </ReTable>
      </template>
    </TableBar>

    <addUpdate
      :editId="editId"
      v-model:dialogVisible="dialogVisible"
      v-model:dialogTitle="dialogTitle"
      @refreshList="onSearch"
    />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
