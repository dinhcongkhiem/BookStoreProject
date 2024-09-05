import classNames from 'classnames/bind';

import style from './CustomArrowSlick.module.scss';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const cx = classNames.bind(style);
function PrevArrow(props) {
    const { style, onClick } = props;
    return (
        <div className={cx('custom-arrow', 'left-arrow')} style={{ ...style }} onClick={onClick}>
            <FontAwesomeIcon icon={faChevronLeft} />
        </div>
    );
}

export default PrevArrow;
