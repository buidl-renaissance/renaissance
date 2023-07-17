import { Dimensions } from 'react-native';

import HTML from 'react-native-render-html';

export const RenderHTML = ({
    html,
    style
}) => {
    return (
        <HTML
            baseStyle={style}
            source={{ html: `<div>${html}</div>` }}
            ignoredStyles={['height', 'width']}
            contentWidth={Dimensions.get('window').width - 32}
            // renderersProps={renderersProps}
            // renderers={renderers}
            // customHTMLElementModels={customHTMLElementModels}
            // domVisitors={domVisitors}
            tagsStyles={{
                //   html: {
                //     color: colors.text,
                //   },
                //   div: {
                //     color: colors.text,
                //   },
                //   p: {
                //     marginTop: 8,
                //     marginBottom: 4,
                //     fontSize: 15,
                //     lineHeight: 22,
                //     color: colors.text,
                //   },
                //   a: {
                //     color: colors.linkText,
                //   },
                //   img: {
                //     width: Dimensions.get('window').width,
                //     resizeMode: 'contain'
                //   },
                //   h2: {
                //     marginTop: 16,
                //     marginBottom: 4,
                //     fontSize: 32,
                //     lineHeight: 36,
                //     color: colors.text,
                //   },
                //   h3: {
                //     marginTop: 16,
                //     marginBottom: 4,
                //     fontSize: 24,
                //     lineHeight: 32,
                //     color: colors.text,
                //   },
                //   b: {
                //     color: colors.text,
                //   },
                //   input: {
                //     color: colors.text,
                //   },
                //   td: {
                //     color: colors.text,
                //   },
                //   li: {
                //     color: colors.text,
                //   },
            }}
        />
    )
}