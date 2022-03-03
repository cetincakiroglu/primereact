import React, { memo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from '../csstransition/CSSTransition';
import { DomHandler, classNames, ZIndexUtils, ObjectUtils } from '../utils/Utils';
import { Portal } from '../portal/Portal';
import PrimeReact from '../api/Api';
import { useUnmountEffect } from '../hooks/useUnmountEffect';

export const Image = memo((props) => {
    const [maskVisible, setMaskVisible] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [rotate, setRotate] = useState(0);
    const [scale, setScale] = useState(1);
    const elementRef = useRef(null);
    const maskRef = useRef(null);
    const previewRef = useRef(null);
    const previewClick = useRef(false);

    const onImageClick = () => {
        if (props.preview) {
            setMaskVisible(true);
            setTimeout(() => {
                setPreviewVisible(true);
            }, 25);
        }
    }

    const onPreviewImageClick = () => {
        previewClick.current = true;
    }

    const onMaskClick = () => {
        if (!previewClick.current) {
            setPreviewVisible(false);
            setRotate(0);
            setScale(1);
        }

        previewClick.current = false;
    }

    const onDownload = () => {
        const { alt: name, src } = props;
        DomHandler.saveAs({ name, src });
        previewClick.current = true;
    }

    const rotateRight = () => {
        setRotate(prevRotate => prevRotate + 90);
        previewClick.current = true;
    }

    const rotateLeft = () => {
        setRotate(prevRotate => prevRotate - 90);
        previewClick.current = true;
    }

    const zoomIn = () => {
        setScale(prevScale => prevScale + 0.1);
        previewClick.current = true;
    }

    const zoomOut = () => {
        setScale(prevScale => prevScale - 0.1);
        previewClick.current = true;
    }

    const onEntering = () => {
        ZIndexUtils.set('modal', maskRef.current, PrimeReact.autoZIndex, PrimeReact.zIndex['modal']);
    }

    const onEntered = () => {
        props.onShow && props.onShow();
    }

    const onExit = () => {
        DomHandler.addClass(maskRef.current, 'p-component-overlay-leave');
    }

    const onExiting = () => {
        props.onHide && props.onHide();
    }

    const onExited = () => {
        ZIndexUtils.clear(maskRef.current);

        setMaskVisible(false);
    }

    useUnmountEffect(() => {
        maskRef.current && ZIndexUtils.clear(maskRef.current);
    });

    const useElement = () => {
        const { downloadable } = props;
        const imagePreviewStyle = { transform: 'rotate(' + rotate + 'deg) scale(' + scale + ')' };
        const zoomDisabled = scale <= 0.5 || scale >= 1.5;
        // const rotateClassName = 'p-image-preview-rotate-' + rotate;

        return (
            <div ref={maskRef} className="p-image-mask p-component-overlay p-component-overlay-enter" onClick={onMaskClick}>
                <div className="p-image-toolbar">
                    {
                        downloadable && (
                            <button className="p-image-action p-link" onClick={onDownload} type="button">
                                <i className="pi pi-download"></i>
                            </button>
                        )
                    }
                    <button className="p-image-action p-link" onClick={rotateRight} type="button">
                        <i className="pi pi-refresh"></i>
                    </button>
                    <button className="p-image-action p-link" onClick={rotateLeft} type="button">
                        <i className="pi pi-undo"></i>
                    </button>
                    <button className="p-image-action p-link" onClick={zoomOut} type="button" disabled={zoomDisabled}>
                        <i className="pi pi-search-minus"></i>
                    </button>
                    <button className="p-image-action p-link" onClick={zoomIn} type="button" disabled={zoomDisabled}>
                        <i className="pi pi-search-plus"></i>
                    </button>
                    <button className="p-image-action p-link" type="button">
                        <i className="pi pi-times"></i>
                    </button>
                </div>
                <CSSTransition nodeRef={previewRef} classNames="p-image-preview" in={previewVisible} timeout={{ enter: 150, exit: 150 }}
                    unmountOnExit onEntering={onEntering} onEntered={onEntered} onExit={onExit} onExiting={onExiting} onExited={onExited}>
                    <div ref={previewRef}>
                        <img src={props.src} className="p-image-preview" style={imagePreviewStyle} onClick={onPreviewImageClick} alt={props.alt} />
                    </div>
                </CSSTransition>
            </div>
        )
    }

    const containerClassName = classNames('p-image p-component', props.className, {
        'p-image-preview-container': props.preview
    });
    const element = useElement();
    const content = props.template ? ObjectUtils.getJSXElement(props.template, props) : <i className="p-image-preview-icon pi pi-eye"></i>

    const { src, alt, width, height } = props;

    return (
        <span ref={elementRef} className={containerClassName} style={props.style}>
            <img src={src} className={props.imageClassName} width={width} height={height} style={props.imageStyle} alt={alt} />
            {
                props.preview && <div className="p-image-preview-indicator" onClick={onImageClick} >
                    {content}
                </div>
            }

            {maskVisible && <Portal element={element} appendTo={document.body} />}
        </span>
    )
})

Image.defaultProps = {
    preview: false,
    className: null,
    downloadable: false,
    style: null,
    imageStyle: null,
    imageClassName: null,
    template: null,
    src: null,
    alt: null,
    width: null,
    height: null
}

Image.propTypes = {
    preview: PropTypes.bool,
    className: PropTypes.string,
    downloadable: PropTypes.bool,
    style: PropTypes.object,
    imageClassName: PropTypes.string,
    imageStyle: PropTypes.object,
    template: PropTypes.any,
    src: PropTypes.string,
    alt: PropTypes.string,
    width: PropTypes.string,
    height: PropTypes.string
}
