import dayjs from "dayjs";
import { getPersonnelList, delPersonnel } from "@/api/system/personnel";
import { type PaginationProps } from "@/components/ReTable";
import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { getStatusLabel, getStatusType } from "@/utils/tools";

export interface paramasType {
  pageIndex: number;
  pageSize: number;
  userName?: string;
  mobilePhone?: string;
}

export function useUser() {
  const statusOptions = reactive([
    { value: "0", label: "可用", type: "success" },
    { value: "1", label: "不可用", type: "info" }
  ]);
  const form = reactive({
    userName: "",
    mobilePhone: ""
  });
  const dataList = ref([]);
  const loading = ref(true);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 100
    },
    {
      label: "ID",
      prop: "userId",
      width: 200
    },
    {
      label: "用户名",
      prop: "account",
      minWidth: 120
    },
    {
      label: "区号 - 手机号",
      minWidth: 200,
      formatter: ({ mobileArea, mobilePhone }) =>
        "+" + mobileArea + " - " + mobilePhone
    },
    {
      label: "状态",
      prop: "locked",
      width: 100,
      cellRenderer: ({ row }) => (
        <el-tag type={getStatusType(statusOptions, row.locked)}>
          {getStatusLabel(statusOptions, row.locked)}
        </el-tag>
      )
    },
    {
      label: "创建时间",
      prop: "createTime",
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "最后修改时间",
      prop: "updateTime",
      width: 180,
      formatter: ({ updateTime }) =>
        dayjs(updateTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      width: 220,
      slot: "operation"
    }
  ];
  const dialogVisible = ref(false);
  const dialogVisible1 = ref(false);
  const dialogTitle = ref("新增人员");
  const editId = ref("");
  const personnelInfo = ref({});

  // 添加
  function showAddUser() {
    editId.value = editId.value === "clickAgain" ? "" : "clickAgain";
    dialogVisible.value = true;
    dialogTitle.value = "新增人员";
  }
  // 编辑
  function handleUpdate(row) {
    editId.value =
      editId.value === row.userId ? row.userId + "clickAgain" : row.userId;
    dialogVisible.value = true;
    dialogTitle.value = "修改人员";
  }
  //删除人员
  function handleDelete(row) {
    const userId = row.userId;
    const msg = `确认删除该人员?`;
    ElMessageBox.confirm(msg, `提示`, {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        deleteDo(userId);
      })
      .catch(() => {
        message("取消操作", {
          type: "info"
        });
      });
  }
  //删除人员接口调用
  function deleteDo(userId) {
    delPersonnel({ data: userId }).then(res => {
      if (res.success) {
        onSearch();
        message("删除成功", {
          type: "success"
        });
      }
    });
  }
  //分配角色
  function handleRole(row) {
    personnelInfo.value = {
      userId: row.userId,
      account: row.account,
      locked: row.locked
    };
    dialogVisible1.value = true;
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
    if (form.userName) {
      paramas.userName = form.userName;
    }
    if (form.mobilePhone) {
      paramas.mobilePhone = form.mobilePhone;
    }
    const data = await getPersonnelList(paramas);
    dataList.value = data.data.rows;
    pagination.total = data.data.totalNum;
    loading.value = false;
  }

  // 重置搜索
  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  onMounted(() => {
    onSearch();
  });

  return {
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
  };
}
