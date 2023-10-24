<script setup lang="ts">
import addImage from "@/assets/images/addImage.png";
import refreshImg from "@/assets/images/refresh.png";
import tipImage from "@/assets/images/tip.png";
import { onMounted, reactive } from "vue";
import { getStoreInfo, uploadStoreLogo } from "@/api/apply";
import { useApply } from "@/views/apply/hook";
import { ElMessage } from "element-plus";

defineOptions({
  name: "Store"
});
const { storeUploadImg } = useApply();
type StoreInfo = {
  avatar: string | ArrayBuffer;
  consumerHotline: string;
  currencyFees: any[];
  manageName: string | null;
  merchantSettlementArea: string | null;
  merchantSettlementName: string;
  merchantSettlementPhone: string | null;
  mobileArea: string;
  mobileNo: string;
  name: string | null;
  settlementCycle: string | null;
};
const storeInfo = reactive<StoreInfo>({
  avatar: "",
  consumerHotline: "",
  currencyFees: [
    { currencyCode: "USD", fee: "0.025%" },
    { currencyCode: "USD", fee: "0.025%" },
    { currencyCode: "USD", fee: "0.025%" },
    { currencyCode: "USD", fee: "0.025%" },
    { currencyCode: "USD", fee: "0.025%" },
    { currencyCode: "USD", fee: "0.025%" }
  ],
  manageName: null,
  merchantSettlementArea: null,
  merchantSettlementName: "",
  merchantSettlementPhone: null,
  mobileArea: "",
  mobileNo: "",
  name: null,
  settlementCycle: null
});

const uploadImage = async imageFile => {
  const reader = new FileReader();
  reader.readAsDataURL(imageFile.file);
  reader.onload = () => {
    storeInfo.avatar = reader.result;
  };
  const imageUrl = await storeUploadImg(imageFile.file);
  if (imageUrl) {
    uploadStoreLogo({ avatar: imageUrl }).then(res => {
      if (res.success) {
        ElMessage.success("LOGO更换成功！");
      }
    });
  }
};
onMounted(() => {
  getStoreInfo().then(res => {
    if (res.success) {
      Object.assign(storeInfo, res.data);
    }
  });
  console.log("storeInfo", storeInfo);
});
</script>
<template>
  <div class="flex flex-col">
    <div class="text-[16px] font-[500]">商户中心</div>
    <div class="flex-1 bg-[#fafafa] mt-[32px] p-[16px]">
      <div class="text-[16px] font-[500]">商户信息</div>
      <div class="flex mt-[24px]">
        <div class="text-[14px]">商户简称：</div>
        <div class="text-[14px] font-[500]">{{ storeInfo.name }}</div>
      </div>
      <div class="flex mt-[16px]">
        <div class="text-[14px]">客服电话：</div>
        <div class="text-[14px] font-[500]">
          {{ storeInfo.consumerHotline }}
        </div>
      </div>
      <div class="flex mt-[16px] items-center">
        <div class="text-[14px]">商户头像：</div>
        <el-upload
          class="mx-[12px]"
          :show-file-list="false"
          :http-request="uploadImage"
        >
          <div
            v-if="storeInfo.avatar"
            class="relative rounded-[35px] overflow-hidden"
          >
            <img :src="storeInfo.avatar" class="w-[70px] h-[70px]" alt="img" />
            <div
              class="absolute w-[70px] h-[70px] top-[0] flex justify-center items-center"
              style="backdrop-filter: blur(1px)"
            >
              <img :src="refreshImg" class="w-[24px] h-[24px]" alt="img" />
            </div>
          </div>
          <div v-else>
            <img :src="addImage" alt="addImage" class="w-[70px] h-[70px]" />
          </div>
        </el-upload>
        <div class="text-[12px] font-[400] text-gray93">
          <div>1.头像大小不能超过2MB</div>
          <div>2.头像尺寸为70px*70px</div>
        </div>
      </div>
    </div>
    <div class="flex-1 bg-[#fafafa] mt-[24px] p-[16px]">
      <div class="text-[16px] font-[500]">结算账户</div>
      <div class="flex mt-[24px]">
        <div class="text-[14px]">汇旺名称：</div>
        <div class="text-[14px] font-[500]">
          {{ storeInfo.merchantSettlementName }}
        </div>
      </div>
      <div class="flex mt-[16px]">
        <div class="text-[14px]">汇旺账号：</div>
        <div class="text-[14px] font-[500]">
          {{ storeInfo.merchantSettlementPhone }}
        </div>
      </div>
    </div>
    <div class="flex-1 bg-[#fafafa] mt-[24px] p-[16px]">
      <div class="text-[16px] font-[500]">结算</div>
      <div class="flex mt-[24px]">
        <div class="text-[14px]">结算周期：</div>
        <div class="text-[14px] font-[500] mr-[8px]">
          {{ storeInfo.settlementCycle }}
        </div>
        <el-popover placement="right-start" width="458" trigger="hover">
          <div class="text-[12px] leading-[22px]">
            实时结算：用户订单付款后，资金实时到账<br />
            D+X结算：用户订单付款后，{$X}个工作日后结算到账<br />
            按周/月结算：用户订单付款后，每月{$X}号/每周星期{$X}结算到账<br />
          </div>
          <template v-slot:reference>
            <img :src="tipImage" alt="addImage" class="w-[24px] h-[24px]" />
          </template>
        </el-popover>
      </div>
    </div>
    <div class="flex-1 bg-[#fafafa] mt-[24px] p-[16px]">
      <div class="text-[16px] font-[500]">联系人</div>
      <div class="flex mt-[24px]">
        <div class="text-[14px]">超级管理员姓名：</div>
        <div class="text-[14px] font-[500]">{{ storeInfo.manageName }}</div>
      </div>
      <div class="flex mt-[16px]">
        <div class="text-[14px]">联系人手机号：</div>
        <div class="text-[14px] font-[500]">{{ storeInfo.mobileNo }}</div>
      </div>
    </div>
    <div class="flex-1 bg-[#fafafa] mt-[24px] p-[16px]">
      <div class="text-[16px] font-[500] mb-[24px]">币种手续费</div>
      <div class="flex gap-x-[80px] flex-wrap">
        <div
          v-for="(item, index) in storeInfo.currencyFees"
          class="flex mb-[16px] w-[130px]"
          :key="index"
        >
          <div class="text-[14px] w-[60px]">{{ item.currencyCode }}：</div>
          <div class="text-[14px] font-[500] w-[60px]">{{ item.fee }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
