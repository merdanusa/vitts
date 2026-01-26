import { RootState } from "@/store";
import {
  addContactToBackend,
  performFullSync,
  removeContactFromBackend,
  selectContactsStats,
  selectFilteredContacts,
  selectFilteredRegisteredUsers,
  setSearchQuery,
  toggleContactFavorite,
  toggleShowFavorites,
} from "@/store/contactsSlice";
import { useAppDispatch } from "@/store/hooks";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const ContactsScreen = () => {
  const dispatch = useAppDispatch();

  const myContacts = useSelector(selectFilteredContacts);
  const registeredUsers = useSelector(selectFilteredRegisteredUsers);
  const stats = useSelector(selectContactsStats);
  const { syncing, syncError, hasPermission, searchQuery, showOnlyFavorites } =
    useSelector((state: RootState) => state.contacts);

  useEffect(() => {
    if (hasPermission === null) {
      dispatch(performFullSync());
    }
  }, [hasPermission]);

  const handleSync = () => {
    dispatch(performFullSync());
  };

  const handleAddContact = (contactId: string) => {
    dispatch(addContactToBackend({ contactId }));
  };

  // Handle remove contact
  const handleRemoveContact = (contactId: string) => {
    dispatch(removeContactFromBackend(contactId));
  };

  // Handle toggle favorite
  const handleToggleFavorite = (contactId: string) => {
    dispatch(toggleContactFavorite(contactId));
  };

  // Handle search
  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  // Render contact item
  const renderContact = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{ padding: 16, flexDirection: "row", alignItems: "center" }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>
        <Text style={{ fontSize: 14, color: "#666" }}>@{item.login}</Text>
      </View>
      {item.isFavorite !== undefined && (
        <TouchableOpacity onPress={() => handleToggleFavorite(item.id)}>
          <Text>{item.isFavorite ? "⭐" : "☆"}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (syncing && myContacts.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Syncing contacts...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header with stats */}
      <View style={{ padding: 16, backgroundColor: "#f5f5f5" }}>
        <Text style={{ fontSize: 14, color: "#666" }}>
          {stats.total} contacts • {stats.registered} on app • {stats.favorites}{" "}
          favorites
        </Text>
        <TouchableOpacity onPress={handleSync} style={{ marginTop: 8 }}>
          <Text style={{ color: "#007AFF" }}>
            {syncing ? "Syncing..." : "Sync Contacts"}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Search contacts..."
        value={searchQuery}
        onChangeText={handleSearch}
        style={{ padding: 12, borderBottomWidth: 1, borderColor: "#ddd" }}
      />

      {/* Filter toggle */}
      <TouchableOpacity
        onPress={() => dispatch(toggleShowFavorites())}
        style={{ padding: 12 }}
      >
        <Text style={{ color: "#007AFF" }}>
          {showOnlyFavorites ? "Show All" : "Show Favorites Only"}
        </Text>
      </TouchableOpacity>

      {/* My Contacts Section */}
      <View style={{ flex: 1 }}>
        <Text
          style={{ padding: 12, fontWeight: "600", backgroundColor: "#f9f9f9" }}
        >
          MY CONTACTS ({myContacts.length})
        </Text>
        <FlatList
          data={myContacts}
          renderItem={renderContact}
          keyExtractor={(item) => item.id}
        />
      </View>

      {/* Registered Users Section */}
      {registeredUsers.length > 0 && (
        <View style={{ maxHeight: 200 }}>
          <Text
            style={{
              padding: 12,
              fontWeight: "600",
              backgroundColor: "#f9f9f9",
            }}
          >
            ON VITTS ({registeredUsers.length})
          </Text>
          <FlatList
            data={registeredUsers}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onPress={() => handleAddContact(item.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600" }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#666" }}>
                    @{item.login}
                  </Text>
                </View>
                <Text style={{ color: "#007AFF" }}>Add</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      )}

      {/* Error display */}
      {syncError && (
        <View style={{ padding: 12, backgroundColor: "#fee" }}>
          <Text style={{ color: "#c00" }}>{syncError}</Text>
        </View>
      )}
    </View>
  );
};

export default ContactsScreen;

// ============================================================================
// USAGE IN OTHER COMPONENTS
// ============================================================================

// Example: Quick sync in ChatScreen
/*
import { performFullSync } from '@/store/contactsSlice';

const ChatScreen = () => {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Sync contacts when entering chats
    dispatch(performFullSync());
  }, []);
  
  // ... rest of component
};
*/

// Example: Check if user is in contacts
/*
import { selectAllContacts } from '@/store/contactsSlice';

const UserProfileScreen = ({ userId }) => {
  const myContacts = useSelector(selectAllContacts);
  const isContact = myContacts.some(c => c.id === userId);
  
  return (
    <View>
      {isContact ? (
        <Text>In your contacts</Text>
      ) : (
        <TouchableOpacity onPress={() => dispatch(addContactToBackend({ contactId: userId }))}>
          <Text>Add to Contacts</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
*/
