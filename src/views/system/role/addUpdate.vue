<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
const { device } = useNav();
import { reactive, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { addRole, updateRole, getRoleInfo } from "@/api/system/role";
import { message } from "@/utils/message";

const props = defineProps({
  editId: { type: String, default: "" },
  dialogVisible: { type: Boolean, default: false },
  dialogTitle: { type: String, default: "添加角色" }
});
const emits = defineEmits(["update:dialogVisible", "refreshList"]);

watch(
  () => props.editId,
  newVal => {
    if (newVal) {
      if (newVal.includes("clickAgain")) {
        newVal = newVal.replace("clickAgain", "");
      }
      if (newVal) {
        getRoleInfo(newVal).then(res => {
          form.value = res.data;
        });
      } else if (formRef?.value) {
        formRef.value.resetFields();
      }
    } else if (formRef?.value) {
      formRef.value.resetFields();
    }
  }
);

const formRef = ref<FormInstance>(null);
const rules = reactive<FormRules>({
  roleName: [{ required: true, message: "请输入角色名", trigger: "blur" }],
  remark: [{ required: true, message: "请输入角色描述", trigger: "blur" }]
});
const btnloading = ref(false);
const form = ref({
  roleName: "",
  remark: ""
});

function closeDialog() {
  emits("update:dialogVisible");
}

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

function submitHandle() {
  let editId = props.editId;
  if (editId.includes("clickAgain")) {
    editId = editId.replace("clickAgain", "");
  }
  if (editId) {
    updateRole(form.value)
      .then(res => {
        if (res.success) {
          message("修改成功！", { type: "success" });
          closeDialog();
          emits("refreshList");
        }
        btnloading.value = false;
      })
      .catch(() => {
        btnloading.value = false;
      });
  } else {
    addRole(form.value)
      .then(res => {
        if (res.success) {
          message("添加成功！", { type: "success" });
          closeDialog();
          formRef.value.resetFields();
          emits("refreshList");
        }
        btnloading.value = false;
      })
      .catch(() => {
        btnloading.value = false;
      });
  }
}
</script>
<template>
  <div>
    <el-dialog
      :modelValue="props.dialogVisible"
      :title="props.dialogTitle"
      @close="closeDialog"
      align-center
      :width="device === 'mobile' ? '95vw' : 500"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        status-icon
      >
        <el-form-item label="角色名" prop="roleName">
          <el-input
            placeholder="请输入角色名"
            type="text"
            v-model.trim="form.roleName"
          />
        </el-form-item>
        <el-form-item label="角色描述" prop="remark">
          <el-input
            maxlength="50"
            type="textarea"
            placeholder="请输入角色描述"
            v-model.trim="form.remark"
          />
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
