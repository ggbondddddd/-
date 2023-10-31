import type { AddressItem } from "@/types/address";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAddressStore = defineStore('add', () => {
  const selectdAddress = ref<AddressItem>()

  const changeSelectdAddress = (val: AddressItem) => {
    selectdAddress.value = val
  }
  return {
    selectdAddress,
    changeSelectdAddress
  }
})
