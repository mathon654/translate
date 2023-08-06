<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
const { device } = useNav();
import { reactive, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { addType, updateType, getType } from "@/api/system/dict";
import { message } from "@/utils/message";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const props = defineProps({
  editId: { type: String, default: "" },
  dialogVisible: { type: Boolean, default: false },
  dialogTitle: { type: String, default: "添加字典" }
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
        getType(newVal).then(res => {
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
  field: [{ required: true, message: t("addUpdate.field"), trigger: "blur" }],
  fieldName: [
    { required: true, message: t("addUpdate.name"), trigger: "blur" }
  ],
  code: [{ required: true, message: t("addUpdate.code"), trigger: "blur" }],
  codeDesc: [
    { required: true, message: t("addUpdate.codeTip"), trigger: "blur" }
  ],
  editMode: [{ required: true, message: t("addUpdate.edit"), trigger: "blur" }]
});
const btnloading = ref(false);
const form = ref({
  field: "",
  fieldName: "",
  code: "",
  codeDesc: "",
  sortNo: 1,
  editMode: "1",
  enabled: "1",
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
    updateType(form.value)
      .then(res => {
        if (res.success) {
          message(t("addUpdate.eidtSuccess"), { type: "success" });
          closeDialog();
          emits("refreshList");
        }
        btnloading.value = false;
      })
      .catch(() => {
        btnloading.value = false;
      });
  } else {
    addType(form.value)
      .then(res => {
        if (res.success) {
          message(t("addUpdate.addSuccess"), { type: "success" });
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
      :width="device === 'mobile' ? '95vw' : '36vw'"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        status-icon
      >
        <el-form-item :label="t('addUpdate.fieldLabel')" prop="field">
          <el-input
            :placeholder="t('addUpdate.field')"
            type="text"
            v-model.trim="form.field"
          />
        </el-form-item>
        <el-form-item :label="t('addUpdate.nameLabel')" prop="fieldName">
          <el-input
            :placeholder="t('addUpdate.name')"
            type="text"
            v-model.trim="form.fieldName"
          />
        </el-form-item>
        <el-form-item :label="t('addUpdate.codeLabel')" prop="code">
          <el-input
            :placeholder="t('addUpdate.code')"
            type="text"
            v-model.trim="form.code"
          />
        </el-form-item>
        <el-form-item :label="t('addUpdate.tipLabel')" prop="codeDesc">
          <el-input
            :placeholder="t('addUpdate.codeTip')"
            type="text"
            v-model.trim="form.codeDesc"
          />
        </el-form-item>
        <el-form-item :label="t('addUpdate.sortLabel')" prop="sortNo">
          <el-input
            maxlength="50"
            type="number"
            :placeholder="t('addUpdate.sortTip')"
            v-model.trim="form.sortNo"
          />
        </el-form-item>
        <el-form-item :label="t('addUpdate.eidtMode')" prop="editMode">
          <el-radio-group v-model="form.editMode">
            <el-radio label="1">{{ t("addUpdate.canEidt") }}</el-radio>
            <el-radio label="0">{{ t("addUpdate.disable") }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('addUpdate.state')" prop="enabled">
          <el-radio-group v-model="form.enabled">
            <el-radio label="1">{{ t("addUpdate.yes") }}</el-radio>
            <el-radio label="0">{{ t("addUpdate.no") }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('addUpdate.desc')" prop="remark">
          <el-input
            :placeholder="t('addUpdate.message')"
            type="textarea"
            v-model.trim="form.remark"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog" class="mr-5">
            {{ t("addUpdate.cancel") }}
          </el-button>
          <el-button type="primary" @click="submitForm" :loading="btnloading">
            {{ t("addUpdate.save") }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped></style>
