import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

type Suggestion = {
  place_id: string;
  description: string;
};

type CustomPlacesAutocompleteProps = {
  value: string;
  onChange: (val: string) => void;
  onSelect: (val: string) => void;
  placeholder?: string;
};
import { GOOGLE_MAPS_APIKEY } from "../constants/Keys";

const fetchSuggestions = async (input: string) => {
  if (!input || input.length < 3) return [];
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${GOOGLE_MAPS_APIKEY}&language=en`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.predictions || [];
  } catch (e) {
    return [];
  }
};

export default function CustomPlacesAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
}: CustomPlacesAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleChange = async (text: string) => {
    onChange(text);
    if (text.length >= 3) {
      const results = await fetchSuggestions(text);
      setSuggestions(results);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (item: any) => {
    onSelect(item.description);
    setShowDropdown(false);
  };

  return (
    <View style={{ width: "100%" }}>
      <TextInput
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        style={styles.input}
        placeholderTextColor="#888"
      />
      {showDropdown && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={suggestions}
            keyExtractor={(item: Suggestion) => item.place_id}
            renderItem={({ item }: { item: Suggestion }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.itemText}>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#fff",
    color: "#222",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dropdown: {
    position: "absolute",
    top: 54,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 12,
    zIndex: 9999,
    maxHeight: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  item: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: {
    color: "#222",
    fontSize: 14,
  },
});
