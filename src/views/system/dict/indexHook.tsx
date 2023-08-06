import dayjs from "dayjs";
import { listType, delType, getSelectData } from "@/api/system/dict";
import { type PaginationProps } from "@/components/ReTable";
import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { getStatusLabel, getStatusType } from "@/utils/tools";
import { $t, transformI18n } from "@/plugins/i18n";

export interface paramasType {
  pageIndex: number;
  pageSize: number;
  field?: string;
}

export function useType() {
  const statusOptions = reactive([
    { value: "0", label: transformI18n($t("addUpdate.no")), type: "info" },
    { value: "1", label: transformI18n($t("addUpdate.yes")), type: "success" }
  ]);
  const dataList = ref([]);
  const loading = ref(true);
  const selectData = ref([]);
  const form = reactive({
    field: ""
  });
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: transformI18n($t("addUpdate.number")),
      prop: "codeId",
      width: 200
    },
    {
      label: transformI18n($t("addUpdate.number")),
      prop: "field",
      width: 120
    },
    {
      label: transformI18n($t("addUpdate.typeName")),
      prop: "fieldName",
      width: 120
    },
    {
      label: transformI18n($t("addUpdate.code1")),
      prop: "code",
      width: 120
    },
    {
      label: transformI18n($t("addUpdate.code2")),
      prop: "codeDesc",
      width: 120
    },
    {
      label: transformI18n($t("addUpdate.eidtMode")),
      prop: "editMode",
      width: 90,
      formatter: ({ editMode }) =>
        editMode === "1"
          ? transformI18n($t("addUpdate.canEidt"))
          : transformI18n($t("addUpdate.disable"))
    },
    {
      label: transformI18n($t("addUpdate.state")),
      prop: "enabled",
      width: 90,
      cellRenderer: ({ row }) => (
        <el-tag type={getStatusType(statusOptions, row.enabled)}>
          {getStatusLabel(statusOptions, row.enabled)}
        </el-tag>
      )
    },
    {
      label: transformI18n($t("addUpdate.sort")),
      prop: "sortNo",
      width: 90
    },
    {
      label: transformI18n($t("addUpdate.desc")),
      prop: "remark",
      minWidth: 160
    },
    {
      label: transformI18n($t("addUpdate.creat")),
      prop: "createTime",
      width: 160,
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: transformI18n($t("addUpdate.update")),
      prop: "updateTime",
      width: 160,
      formatter: ({ updateTime }) =>
        dayjs(updateTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: transformI18n($t("addUpdate.action")),
      width: 200,
      slot: "operation"
    }
  ];
  const dialogVisible = ref(false);
  const dialogTitle = ref("添加字典");
  const editId = ref("");

  // 添加
  function handleAdd() {
    editId.value = editId.value === "clickAgain" ? "" : "clickAgain";
    dialogVisible.value = true;
    dialogTitle.value = transformI18n($t("addUpdate.add"));
  }
  // 编辑
  function handleUpdate(row) {
    editId.value =
      editId.value === row.codeId ? row.codeId + "clickAgain" : row.codeId;
    dialogVisible.value = true;
    dialogTitle.value = transformI18n($t("addUpdate.eidt2"));
  }
  //删除
  function handleDelete(row) {
    const codeId = row.codeId;
    const msg = transformI18n($t("addUpdate.tip1"));
    ElMessageBox.confirm(msg, transformI18n($t("addUpdate.tip2")), {
      confirmButtonText: transformI18n($t("addUpdate.tip3")),
      cancelButtonText: transformI18n($t("addUpdate.cancel")),
      type: "warning"
    })
      .then(() => {
        deleteDo(codeId);
      })
      .catch(() => {
        message(transformI18n($t("addUpdate.tip4")), {
          type: "info"
        });
      });
  }
  //删除接口调用
  function deleteDo(codeId) {
    delType(codeId).then(res => {
      if (res.success) {
        onSearch();
        message(transformI18n($t("addUpdate.tip5")), {
          type: "success"
        });
      }
    });
  }
  // 分页数量改变
  function handleSizeChange() {
    onSearch();
  }
  //当前页改变
  function handleCurrentChange() {
    onSearch();
  }

  // 获取列表
  async function onSearch() {
    loading.value = true;
    const paramas: paramasType = {
      pageSize: pagination.pageSize,
      pageIndex: pagination.currentPage
    };
    if (form.field) {
      paramas.field = form.field;
    }
    const data = await listType(paramas);
    dataList.value = data.data.rows;
    pagination.total = data.data.totalNum;
    loading.value = false;
  }
  //获取下拉框数据
  function getSelectDatafunc() {
    getSelectData().then(res => {
      if (res.success) {
        selectData.value = res.data;
      }
    });
  }

  // 重置搜索
  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  onMounted(() => {
    onSearch();
    getSelectDatafunc();
  });

  return {
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
  };
}
