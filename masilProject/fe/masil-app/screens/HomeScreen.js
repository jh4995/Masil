import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button, Badge } from 'react-native-paper';
import { ACTIVITIES } from '../data';
import { useCart } from '../contexts/CartContext';

export default function HomeScreen({ navigation }) {
  const { cartItems, addToCart } = useCart();

  const renderActivity = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>📍 {item.location}</Paragraph>
        <Paragraph>⏰ {item.time}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button icon="cart-plus" mode="contained" onPress={() => addToCart(item)}>
          장바구니 담기
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="마실가실" subtitle="오늘의 추천 활동" />
        <View>
          <Appbar.Action icon="cart" onPress={() => navigation.navigate('Cart')} />
          {cartItems.length > 0 && (
            <Badge style={styles.badge} size={20}>{cartItems.length}</Badge>
          )}
        </View>
      </Appbar.Header>
      <FlatList
        data={ACTIVITIES}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { marginHorizontal: 16, marginVertical: 8 },
  list: { paddingVertical: 8 },
  badge: { position: 'absolute', top: 5, right: 5 },
});