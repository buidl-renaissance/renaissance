// import React, { FC, useEffect, useRef, useState} from 'react';
// import {
//   Animated,
//   Dimensions,
//   FlatList,
//   Image,
//   StyleSheet,
//   Text,
//   View,
// } from 'react-native';

// const {width} = Dimensions.get('window');

// const SPACING = 5;
// const ITEM_LENGTH = width * 0.8; // Item is a square. Therefore, its height and width are of the same length.
// const EMPTY_ITEM_LENGTH = (width - ITEM_LENGTH) / 2;
// const BORDER_RADIUS = 20;
// const CURRENT_ITEM_TRANSLATE_Y = 48;

// interface ImageCarouselProps {
//   data: ImageCarouselItem[];
// }

// const ImageCarousel: FC<ImageCarouselProps> = ({data}) => {
//   const scrollX = useRef(new Animated.Value(0)).current;
//   const [dataWithPlaceholders, setDataWithPlaceholders] = useState<>([]);

//   useEffect(() => {
//     setDataWithPlaceholders([{id: -1}, ...data, {id: data.length}]);
//   }, [data]);

//   return (
//     <View style={styles.container}>
//       <FlatList
//         ref={flatListRef}
//         data={dataWithPlaceholders}
//         renderItem={({item, index}) => {
//           if (!item.uri || !item.title) {
//             return <View style={{width: EMPTY_ITEM_LENGTH}} />;
//           }

//           const inputRange = [
//             (index - 2) * ITEM_LENGTH,
//             (index - 1) * ITEM_LENGTH,
//             index * ITEM_LENGTH,
//           ];

//           const translateY = scrollX.interpolate({
//             inputRange,
//             outputRange: [
//               CURRENT_ITEM_TRANSLATE_Y * 2,
//               CURRENT_ITEM_TRANSLATE_Y,
//               CURRENT_ITEM_TRANSLATE_Y * 2,
//             ],
//             extrapolate: 'clamp',
//           });

//           return (
//             <View style={{width: ITEM_LENGTH}}>
//               <Animated.View
//                 style={[
//                   {
//                     transform: [{translateY}],
//                   },
//                   styles.itemContent,
//                 ]}>
//                 <Image source={{uri: item.uri}} style={styles.itemImage} />
//                 <Text style={styles.itemText} numberOfLines={1}>
//                   {item.title}
//                 </Text>
//               </Animated.View>
//             </View>
//           );
//         }}
//         getItemLayout={getItemLayout}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={item => item.id}
//         bounces={false}
//         decelerationRate={0}
//         renderToHardwareTextureAndroid
//         contentContainerStyle={styles.flatListContent}
//         snapToInterval={ITEM_LENGTH}
//         snapToAlignment="start"
//         onScroll={Animated.event(
//           [{nativeEvent: {contentOffset: {x: scrollX}}}],
//           {useNativeDriver: false},
//         )}
//         scrollEventThrottle={16}
//       />
//     </View>
//   );
// };

// export default ImageCarousel;

// const styles = StyleSheet.create({
//   container: {},
//   flatListContent: {
//     height: CURRENT_ITEM_TRANSLATE_Y * 2 + ITEM_LENGTH,
//     alignItems: 'center',
//     marginBottom: CURRENT_ITEM_TRANSLATE_Y,
//   },
//   itemContent: {
//     marginHorizontal: SPACING * 3,
//     alignItems: 'center',
//     backgroundColor: 'white',
//     borderRadius: BORDER_RADIUS + SPACING * 2,
//   },
//   itemText: {
//     fontSize: 24,
//     position: 'absolute',
//     bottom: SPACING * 2,
//     right: SPACING * 2,
//     color: 'white',
//     fontWeight: '600',
//   },
//   itemImage: {
//     width: '100%',
//     height: ITEM_LENGTH,
//     borderRadius: BORDER_RADIUS,
//     resizeMode: 'cover',
//   },
// });