import PropTypes from 'prop-types';
import { memo } from 'react';
import { Link } from 'react-router-dom';

function DetailInfoItems({ isLink, label, value }) {
    if (value === null || value === undefined) {
        return null;
    }

    let valueElement = value;

    if (Array.isArray(value)) {
        valueElement = (
            <>
                {value.map((val, index) => (
                    <span key={index}>
                        <Link to={`/product/authors=${val}`}>{val}</Link>
                        {index < value.length - 1 && ', '}
                    </span>
                ))}
            </>
        );
    } else if (isLink) {
        valueElement = <Link to={`/product/authors=${value}`}>{value}</Link>;
    }
    return (
        <div className="row">
            <p className="col-3" style={{ color: '#7a7e7f' }}>
                {label}
            </p>
            <p className="col-9">{valueElement}</p>
        </div>
    );
}
DetailInfoItems.propTypes = {
    isLink: PropTypes.bool.isRequired,
    label: PropTypes.string,
    value: PropTypes.node,
};

export default memo(DetailInfoItems);
