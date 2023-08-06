<script setup lang="ts">
import { ref } from "vue";
import { useUser } from "./hook";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Role from "@iconify-icons/ri/admin-line";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import addUpdate from "./addUpdate.vue";
import assigningRoles from "./assignRoles.vue";

defineOptions({
  name: "Personnel"
});

const formRef = ref();
const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  handleUpdate,
  handleDelete,
  handleRole,
  handleSizeChange,
  handleCurrentChange,
  showAddUser,
  dialogVisible,
  dialogVisible1,
  dialogTitle,
  editId,
  personnelInfo
} = useUser();
</script>

<template>
  <div class="main">
    <el-form ref="formRef" :inline="true" :model="form" class="w-[99/100] pl-4">
      <el-form-item label="人员名称：" prop="userName">
        <el-input
          v-model="form.userName"
          placeholder="请输入人员名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="手机号码：" prop="mobilePhone">
        <el-input
          v-model="form.mobilePhone"
          placeholder="请输入手机号码"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <TableBar @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="showAddUser"
          v-permission="'system:personnel:add'"
        >
          新增人员
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
                v-permission="'system:personnel:update'"
              >
                <span class="text-xs">修改</span>
              </el-button>
              <el-button
                class="reset-margin"
                link
                type="warning"
                :size="size"
                :icon="useRenderIcon(Role)"
                @click="handleRole(row)"
                v-permission="'system:personnel:authorizeRole'"
              >
                <span class="text-xs">分配角色</span>
              </el-button>
              <el-button
                class="reset-margin"
                link
                type="danger"
                :size="size"
                :icon="useRenderIcon(Delete)"
                @click="handleDelete(row)"
                v-permission="'system:personnel:delete'"
              >
                <span class="text-xs">删除</span>
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
    <assigningRoles
      :personnelInfo="personnelInfo"
      v-model:dialogVisible1="dialogVisible1"
    />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
