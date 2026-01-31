import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Group, GroupMember } from "@/services/api";

interface GroupsState {
  groups: Group[];
  selectedGroup: Group | null;
  loading: boolean;
}

const initialState: GroupsState = {
  groups: [],
  selectedGroup: null,
  loading: false,
};

const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    setGroups: (state, action: PayloadAction<Group[]>) => {
      state.groups = action.payload;
      console.log("[GROUPS SLICE] Groups set:", action.payload.length);
    },
    addGroup: (state, action: PayloadAction<Group>) => {
      // Add group if it doesn't already exist
      const exists = state.groups.some((g) => g.id === action.payload.id);
      if (!exists) {
        state.groups.unshift(action.payload);
        console.log("[GROUPS SLICE] Group added:", action.payload.name);
      }
    },
    updateGroup: (state, action: PayloadAction<Group>) => {
      const index = state.groups.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) {
        state.groups[index] = action.payload;
        console.log("[GROUPS SLICE] Group updated:", action.payload.id);
      }
      // Update selected group if it matches
      if (state.selectedGroup?.id === action.payload.id) {
        state.selectedGroup = action.payload;
      }
    },
    removeGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter((g) => g.id !== action.payload);
      console.log("[GROUPS SLICE] Group removed:", action.payload);
      // Clear selected group if it was removed
      if (state.selectedGroup?.id === action.payload) {
        state.selectedGroup = null;
      }
    },
    setSelectedGroup: (state, action: PayloadAction<Group | null>) => {
      state.selectedGroup = action.payload;
      console.log("[GROUPS SLICE] Selected group:", action.payload?.name || "none");
    },
    updateGroupMembers: (
      state,
      action: PayloadAction<{ groupId: string; members: GroupMember[] }>
    ) => {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (group) {
        group.participants = action.payload.members;
        console.log(
          "[GROUPS SLICE] Group members updated:",
          action.payload.groupId,
          action.payload.members.length
        );
      }
      // Update selected group if it matches
      if (state.selectedGroup?.id === action.payload.groupId) {
        state.selectedGroup.participants = action.payload.members;
      }
    },
    addGroupMember: (
      state,
      action: PayloadAction<{ groupId: string; member: GroupMember }>
    ) => {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (group) {
        // Add member if not already in group
        const exists = group.participants.some(
          (m) => m.userId === action.payload.member.userId
        );
        if (!exists) {
          group.participants.push(action.payload.member);
          console.log(
            "[GROUPS SLICE] Member added to group:",
            action.payload.member.name
          );
        }
      }
      // Update selected group if it matches
      if (state.selectedGroup?.id === action.payload.groupId) {
        const exists = state.selectedGroup.participants.some(
          (m) => m.userId === action.payload.member.userId
        );
        if (!exists) {
          state.selectedGroup.participants.push(action.payload.member);
        }
      }
    },
    removeGroupMember: (
      state,
      action: PayloadAction<{ groupId: string; userId: string }>
    ) => {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (group) {
        group.participants = group.participants.filter(
          (m) => m.userId !== action.payload.userId
        );
        console.log("[GROUPS SLICE] Member removed from group:", action.payload.userId);
      }
      // Update selected group if it matches
      if (state.selectedGroup?.id === action.payload.groupId) {
        state.selectedGroup.participants = state.selectedGroup.participants.filter(
          (m) => m.userId !== action.payload.userId
        );
      }
    },
    updateMemberRole: (
      state,
      action: PayloadAction<{
        groupId: string;
        userId: string;
        role: "owner" | "admin" | "member";
      }>
    ) => {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (group) {
        const member = group.participants.find(
          (m) => m.userId === action.payload.userId
        );
        if (member) {
          member.role = action.payload.role;
          console.log(
            "[GROUPS SLICE] Member role updated:",
            action.payload.userId,
            action.payload.role
          );
        }
      }
      // Update selected group if it matches
      if (state.selectedGroup?.id === action.payload.groupId) {
        const member = state.selectedGroup.participants.find(
          (m) => m.userId === action.payload.userId
        );
        if (member) {
          member.role = action.payload.role;
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearGroups: (state) => {
      state.groups = [];
      state.selectedGroup = null;
      state.loading = false;
      console.log("[GROUPS SLICE] Groups cleared");
    },
  },
});

export const {
  setGroups,
  addGroup,
  updateGroup,
  removeGroup,
  setSelectedGroup,
  updateGroupMembers,
  addGroupMember,
  removeGroupMember,
  updateMemberRole,
  setLoading,
  clearGroups,
} = groupsSlice.actions;

export default groupsSlice.reducer;
