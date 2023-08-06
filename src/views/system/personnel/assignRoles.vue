<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
const { device } = useNav();
import { ref, watch } from "vue";
import type { FormInstance } from "element-plus";
import { getPersonnelRole, authorizeRole } from "@/api/system/personnel";
import { getRoleList } from "@/api/system/role";
import { message } from "@/utils/message";

const props = defineProps({
  personnelInfo: Object,
  dialogVisible1: { type: Boolean, default: false }
});
const emits = defineEmits(["update:dialogVisible1"]);

watch(
  () => props.personnelInfo.userId,
  async newVal => {
    if (newVal) {
      form.value.account = props.personnelInfo.account;
      form.value.locked = props.personnelInfo.locked;
      await getAllroleFuc();
      getuserRoleinfoFuc();
    }
  }
);

const formRef = ref<FormInstance>(null);
const btnloading = ref(false);
const roles = ref([]);
const form = ref({
  account: "",
  locked: "",
  roleIds: []
});

function closeDialog() {
  emits("update:dialogVisible1");
}
// 获取所有的角色信息
function getAllroleFuc() {
  const params = { pageIndex: 1, pageSize: 100 };
  getRoleList(params).then(res => {
    roles.value = res.data.rows;
  });
}
// 获取用户对应的角色信息
function getuserRoleinfoFuc() {
  getPersonnelRole(props.personnelInfo.userId).then(res => {
    form.value.roleIds = res.data.map(v => {
      return v.roleId;
    });
  });
}
//提交
function submitForm() {
  btnloading.value = true;
  formRef.value.validate(valid => {
    if (valid) {
      submitHandle();
    } else {
      btnloading.value = false;
      return false;
    }
  });
}
//提交接口调用
function submitHandle() {
  const params = {
    roleIds: form.value.roleIds,
    userId: props.personnelInfo.userId
  };
  authorizeRole(params)
    .then(res => {
      if (res.success) {
        message("操作成功！", { type: "success" });
        closeDialog();
        formRef.value.resetFields();
      }
      btnloading.value = false;
    })
    .catch(() => {
      btnloading.value = false;
    });
}
</script>
<template>
  <div>
    <el-dialog
      :modelValue="props.dialogVisible1"
      title="分配角色"
      @close="closeDialog"
      align-center
      :width="device === 'mobile' ? '95vw' : 500"
    >
      <el-form ref="formRef" :model="form" label-width="120px" status-icon>
        <el-form-item label="用户名" prop="account">
          <el-input type="text" disabled v-model.trim="form.account" />
        </el-form-item>
        <el-form-item label="人员状态" prop="locked">
          <el-radio label="0" disabled v-model="form.locked">可用</el-radio>
          <el-radio label="1" disabled v-model="form.locked">不可用</el-radio>
        </el-form-item>
        <el-form-item label="人员角色" prop="remark">
          <el-checkbox-group v-model="form.roleIds">
            <el-checkbox
              :label="item.roleId"
              name="type"
              v-for="item in roles"
              :key="item.roleId"
              >{{ item.roleName }}</el-checkbox
            >
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog" class="mr-5">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="btnloading">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped></style>
