import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Appbar, Card, Title, Button, Text } from 'react-native-paper';
import { useCart } from '../contexts/CartContext';

export default function CartScreen({ navigation }) {
  const { cartItems } = useCart();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="내 장바구니" />
      </Appbar.Header>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall">장바구니가 비어있어요.</Text>
          <Text variant="bodyMedium">홈 화면에서 참여할 활동을 담아보세요!</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <Card.Title title={item.name} subtitle={`${item.location} / ${item.time}`} />
              </Card>
            )}
            contentContainerStyle={styles.list}
          />
          <Button
            mode="contained"
            icon="check-circle"
            style={styles.button}
            labelStyle={styles.buttonText}
            onPress={() => alert('스케줄이 확정되었습니다! (기능 구현 필요)')}
          >
            스케줄 확정하기
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginHorizontal: 16, marginVertical: 8 },
  list: { paddingVertical: 8 },
  button: { margin: 16, padding: 8, borderRadius: 8 },
  buttonText: { fontSize: 18 },
});