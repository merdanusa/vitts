import { api } from "@/services/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as Contacts from "expo-contacts";
import { createSelector } from "reselect";

export interface DeviceContact {
  id: string;
  name: string;
  phoneNumbers: string[];
  image?: string | null;
}

export interface AppContact {
  id: string;
  name: string;
  login: string;
  avatar: string;
  phoneNumber: string;
  isOnline: boolean;
  isFavorite?: boolean;
  isBlocked?: boolean;
  addedAt?: string;
}

export interface ContactsState {
  // Device contacts
  deviceContacts: DeviceContact[];
  deviceContactsLoading: boolean;

  // App registered users
  registeredUsers: AppContact[];
  registeredUsersLoading: boolean;

  // User's saved contacts (from backend)
  myContacts: AppContact[];
  myContactsLoading: boolean;

  // Contacts to invite
  nonRegisteredContacts: DeviceContact[];

  // Permissions
  hasPermission: boolean | null;
  permissionAsked: boolean;

  // Sync status
  lastSyncTime: string | null;
  syncing: boolean;
  syncError: string | null;

  // Search & filters
  searchQuery: string;
  showOnlyFavorites: boolean;

  // UI states
  error: string | null;
}

const initialState: ContactsState = {
  deviceContacts: [],
  deviceContactsLoading: false,
  registeredUsers: [],
  registeredUsersLoading: false,
  myContacts: [],
  myContactsLoading: false,
  nonRegisteredContacts: [],
  hasPermission: null,
  permissionAsked: false,
  lastSyncTime: null,
  syncing: false,
  syncError: null,
  searchQuery: "",
  showOnlyFavorites: false,
  error: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Request contacts permission
export const requestContactsPermission = createAsyncThunk(
  "contacts/requestPermission",
  async (_, { rejectWithValue }) => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      return status === "granted";
    } catch (error: any) {
      return rejectWithValue(error.message || "Permission request failed");
    }
  },
);

// Fetch device contacts
export const fetchDeviceContacts = createAsyncThunk(
  "contacts/fetchDevice",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { contacts: ContactsState };

      if (!state.contacts.hasPermission) {
        throw new Error("No permission to access contacts");
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Image,
        ],
        sort: Contacts.SortTypes.FirstName,
      });

      // Format and filter contacts with phone numbers
      const formatted = data
        .filter(
          (contact) => contact.phoneNumbers && contact.phoneNumbers.length > 0,
        )
        .map((contact) => ({
          id: contact.id,
          name: contact.name || "Unknown",
          phoneNumbers: contact.phoneNumbers!.map((p) =>
            p.number!.replace(/[\s\-\(\)\+]/g, ""),
          ),
          image: contact.imageAvailable ? contact.image?.uri : null,
        }));

      return formatted;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch contacts");
    }
  },
);

// Sync contacts with backend
export const syncContactsWithBackend = createAsyncThunk(
  "contacts/sync",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { contacts: ContactsState };
      const phoneNumbers = state.contacts.deviceContacts.flatMap(
        (c) => c.phoneNumbers,
      );

      if (phoneNumbers.length === 0) {
        throw new Error("No phone numbers to sync");
      }

      const response = await api.post("/api/contacts/sync", {
        phoneNumbers: phoneNumbers,
      });

      return {
        users: response.data.users as AppContact[],
        syncTime: new Date().toISOString(),
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Sync failed",
      );
    }
  },
);

// Get my saved contacts from backend
export const fetchMyContacts = createAsyncThunk(
  "contacts/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/contacts");
      return response.data.contacts as AppContact[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// Add contact to backend
export const addContactToBackend = createAsyncThunk(
  "contacts/add",
  async (
    { contactId, nickname }: { contactId: string; nickname?: string },
    { rejectWithValue },
  ) => {
    try {
      await api.post("/api/contacts/add", {
        contactId,
        username: nickname,
      });
      return { contactId, nickname };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// Remove contact from backend
export const removeContactFromBackend = createAsyncThunk(
  "contacts/remove",
  async (contactId: string, { rejectWithValue }) => {
    try {
      await api.post("/api/contacts/remove", { contactId });
      return contactId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// Toggle favorite
export const toggleContactFavorite = createAsyncThunk(
  "contacts/toggleFavorite",
  async (contactId: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/contacts/favorite", { contactId });
      return { contactId, isFavorite: response.data.isFavorite };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// Toggle block
export const toggleContactBlock = createAsyncThunk(
  "contacts/toggleBlock",
  async (contactId: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/contacts/block", { contactId });
      return { contactId, isBlocked: response.data.isBlocked };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// Full sync flow (permission -> fetch -> sync)
export const performFullSync = createAsyncThunk(
  "contacts/fullSync",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // 1. Check/request permission
      const permissionResult = await dispatch(
        requestContactsPermission(),
      ).unwrap();
      if (!permissionResult) {
        throw new Error("Permission denied");
      }

      // 2. Fetch device contacts
      await dispatch(fetchDeviceContacts()).unwrap();

      // 3. Sync with backend
      await dispatch(syncContactsWithBackend()).unwrap();

      // 4. Fetch my saved contacts
      await dispatch(fetchMyContacts()).unwrap();

      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || "Full sync failed");
    }
  },
);

const contactsSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    toggleShowFavorites: (state) => {
      state.showOnlyFavorites = !state.showOnlyFavorites;
    },
    clearError: (state) => {
      state.error = null;
      state.syncError = null;
    },
    resetContactsState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Request Permission
    builder
      .addCase(requestContactsPermission.pending, (state) => {
        state.permissionAsked = true;
      })
      .addCase(requestContactsPermission.fulfilled, (state, action) => {
        state.hasPermission = action.payload;
        if (!action.payload) {
          state.error = "Contacts permission denied";
        }
      })
      .addCase(requestContactsPermission.rejected, (state, action) => {
        state.hasPermission = false;
        state.error = action.payload as string;
      });

    // Fetch Device Contacts
    builder
      .addCase(fetchDeviceContacts.pending, (state) => {
        state.deviceContactsLoading = true;
        state.error = null;
      })
      .addCase(fetchDeviceContacts.fulfilled, (state, action) => {
        state.deviceContactsLoading = false;
        state.deviceContacts = action.payload;
      })
      .addCase(fetchDeviceContacts.rejected, (state, action) => {
        state.deviceContactsLoading = false;
        state.error = action.payload as string;
      });

    // Sync with Backend
    builder
      .addCase(syncContactsWithBackend.pending, (state) => {
        state.syncing = true;
        state.syncError = null;
      })
      .addCase(syncContactsWithBackend.fulfilled, (state, action) => {
        state.syncing = false;
        state.registeredUsers = action.payload.users;
        state.lastSyncTime = action.payload.syncTime;

        // Calculate non-registered contacts
        const registeredPhones = action.payload.users.map((u) => u.phoneNumber);
        state.nonRegisteredContacts = state.deviceContacts.filter(
          (dc) =>
            !dc.phoneNumbers.some((phone) => registeredPhones.includes(phone)),
        );
      })
      .addCase(syncContactsWithBackend.rejected, (state, action) => {
        state.syncing = false;
        state.syncError = action.payload as string;
      });

    // Fetch My Contacts
    builder
      .addCase(fetchMyContacts.pending, (state) => {
        state.myContactsLoading = true;
      })
      .addCase(fetchMyContacts.fulfilled, (state, action) => {
        state.myContactsLoading = false;
        state.myContacts = action.payload;
      })
      .addCase(fetchMyContacts.rejected, (state, action) => {
        state.myContactsLoading = false;
        state.error = action.payload as string;
      });

    // Add Contact
    builder.addCase(addContactToBackend.fulfilled, (state, action) => {
      // Find in registered users and add to my contacts
      const user = state.registeredUsers.find(
        (u) => u.id === action.payload.contactId,
      );
      if (user) {
        state.myContacts.push({
          ...user,
          isFavorite: false,
          isBlocked: false,
          addedAt: new Date().toISOString(),
        });
      }
    });

    // Remove Contact
    builder.addCase(removeContactFromBackend.fulfilled, (state, action) => {
      state.myContacts = state.myContacts.filter(
        (c) => c.id !== action.payload,
      );
    });

    // Toggle Favorite
    builder.addCase(toggleContactFavorite.fulfilled, (state, action) => {
      const contact = state.myContacts.find(
        (c) => c.id === action.payload.contactId,
      );
      if (contact) {
        contact.isFavorite = action.payload.isFavorite;
      }
    });

    // Toggle Block
    builder.addCase(toggleContactBlock.fulfilled, (state, action) => {
      const contact = state.myContacts.find(
        (c) => c.id === action.payload.contactId,
      );
      if (contact) {
        contact.isBlocked = action.payload.isBlocked;
      }
    });

    // Full Sync
    builder
      .addCase(performFullSync.pending, (state) => {
        state.syncing = true;
        state.syncError = null;
      })
      .addCase(performFullSync.fulfilled, (state) => {
        state.syncing = false;
      })
      .addCase(performFullSync.rejected, (state, action) => {
        state.syncing = false;
        state.syncError = action.payload as string;
      });
  },
});

export const selectAllContacts = (state: { contacts: ContactsState }) =>
  state.contacts.myContacts;

export const selectRegisteredUsers = (state: { contacts: ContactsState }) =>
  state.contacts.registeredUsers;

export const selectNonRegisteredContacts = (state: {
  contacts: ContactsState;
}) => state.contacts.nonRegisteredContacts;

export const selectFavoriteContacts = (state: { contacts: ContactsState }) =>
  state.contacts.myContacts.filter((c) => c.isFavorite);

const selectMyContacts = (state: { contacts: ContactsState }) =>
  state.contacts.myContacts;

const selectSearchQuery = (state: { contacts: ContactsState }) =>
  state.contacts.searchQuery;

const selectShowOnlyFavorites = (state: { contacts: ContactsState }) =>
  state.contacts.showOnlyFavorites;

const selectDeviceContacts = (state: { contacts: ContactsState }) =>
  state.contacts.deviceContacts;

const selectNonRegisteredContactsRaw = (state: { contacts: ContactsState }) =>
  state.contacts.nonRegisteredContacts;

export const selectFilteredContacts = createSelector(
  [selectMyContacts, selectSearchQuery, selectShowOnlyFavorites],
  (myContacts, searchQuery, showOnlyFavorites) => {
    let filtered = myContacts;

    if (showOnlyFavorites) {
      filtered = filtered.filter((c) => c.isFavorite);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.login.toLowerCase().includes(query),
      );
    }

    return filtered;
  },
);

export const selectFilteredRegisteredUsers = createSelector(
  [selectRegisteredUsers, selectSearchQuery, selectMyContacts],
  (registeredUsers, searchQuery, myContacts) => {
    const myContactIds = myContacts.map((c) => c.id);

    let filtered = registeredUsers.filter((u) => !myContactIds.includes(u.id));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.login.toLowerCase().includes(query),
      );
    }

    return filtered;
  },
);

export const selectContactsStats = createSelector(
  [
    selectMyContacts,
    selectDeviceContacts,
    selectRegisteredUsers,
    selectNonRegisteredContactsRaw,
  ],
  (myContacts, deviceContacts, registeredUsers, nonRegisteredContacts) => ({
    total: myContacts.length,
    favorites: myContacts.filter((c) => c.isFavorite).length,
    blocked: myContacts.filter((c) => c.isBlocked).length,
    onDevice: deviceContacts.length,
    registered: registeredUsers.length,
    nonRegistered: nonRegisteredContacts.length,
  }),
);

export const {
  setSearchQuery,
  toggleShowFavorites,
  clearError,
  resetContactsState,
} = contactsSlice.actions;

export default contactsSlice.reducer;
