import { createSlice } from "@reduxjs/toolkit";
import { getLocalStorage, setLocalStorage } from "@/utils/localstorage";
import { notifyError, notifySuccess } from "@/utils/toast";

interface Job {
  id: string;
  createdTime: string;
  employerId: string;
  title: string;
  description: string;
  tags: string[];
  wage: number;
  wageType: string;
  location: string;
  jobType: string;
  schedule: string;
  hours: string;
  startDate: string;
  benefits: string[];
  requirements: string[];
  responsibilities: string[];
  howToApply: string;
  advertiseUntil: string;
  jobBankId: string;
  status: string;
  employer?: {
    id: string;
    companyName: string;
    logo: string;
    website: string;
    location: string;
    contactEmail: string;
    phone: string;
    industry: string;
  }
}

interface WishlistState {
  wishlist: Job[];
}

// Check if the cookie exists
const wishlistData = getLocalStorage("wishlist_items");
let initialWishlistState: WishlistState = {
  wishlist: [],
};

// If the wishlist exists, parse its value and set it as the initial state
if (wishlistData) {
  try {
    initialWishlistState = {
      wishlist: wishlistData,
    };
  } catch (error) {
    console.error("Error parsing wishlist data:", error);
  }
}

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: initialWishlistState,
  reducers: {
    add_to_wishlist: (state, { payload }) => {
      const isExist = state.wishlist.some((item) => item.id === payload.id);
      if (!isExist) {
        state.wishlist.push(payload);
        notifySuccess(`${payload.title} added to wishlist`);
      } else {
        state.wishlist = state.wishlist.filter((item) => item.id !== payload.id);
        notifyError(`${payload.title} removed from wishlist`);
      }
      setLocalStorage("wishlist_items", state.wishlist);
    },
    remove_wishlist_product: (state, { payload }) => {
      state.wishlist = state.wishlist.filter((item) => item.id !== payload.id);
      notifyError(`${payload.title} removed from wishlist`);
      setLocalStorage("wishlist_items", state.wishlist);
      notifyError(`${payload.title} removed from wishlist`);
    }
  },
});

export const {
  add_to_wishlist,
  remove_wishlist_product,
} = wishlistSlice.actions;
export default wishlistSlice.reducer;
