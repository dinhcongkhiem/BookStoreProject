import { InfinitySpin } from 'react-loader-spinner';

function ModalLoading({ isLoading }) {
    return (
        <div
            style={{
                position: 'fixed',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                display: isLoading ? 'flex' : 'none',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 999999,
            }}
        >
            <InfinitySpin
                visible={true}
                width="200"
                color="#0C92A9"
                ariaLabel="infinity-spin-loading"
            ></InfinitySpin>

        </div>
    );
}
export default ModalLoading;
