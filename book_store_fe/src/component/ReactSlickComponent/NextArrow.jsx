import classNames from 'classnames/bind';

import style from './CustomArrowSlick.module.scss';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const cx = classNames.bind(style);
function NextArrow(props) {
    const { style, onClick, classNames } = props;
    return (
        <div className={cx('custom-arrow', 'right-arrow', classNames)} style={{ ...style }} onClick={onClick}>
            <FontAwesomeIcon icon={faChevronRight} />
        </div>
    );
}

export default NextArrow;
