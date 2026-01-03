import { Dimensions } from 'react-native';

import HTML from 'react-native-render-html';
import { theme } from '../colors';

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
                html: {
                    color: theme.text,
                },
                div: {
                    color: theme.text,
                },
                p: {
                    marginTop: 8,
                    marginBottom: 4,
                    fontSize: 15,
                    lineHeight: 22,
                    color: theme.text,
                },
                a: {
                    color: theme.primary,
                    textDecorationLine: 'underline',
                },
                img: {
                    width: Dimensions.get('window').width,
                    resizeMode: 'contain'
                },
                h2: {
                    marginTop: 16,
                    marginBottom: 4,
                    fontSize: 32,
                    lineHeight: 36,
                    color: theme.text,
                },
                h3: {
                    marginTop: 16,
                    marginBottom: 4,
                    fontSize: 24,
                    lineHeight: 32,
                    color: theme.text,
                },
                b: {
                    color: theme.text,
                },
                input: {
                    color: theme.text,
                },
                td: {
                    color: theme.text,
                },
                li: {
                    color: theme.text,
                },
            }}
        />
    )
}