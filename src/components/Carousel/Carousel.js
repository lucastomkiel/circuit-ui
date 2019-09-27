/**
 * Copyright 2019, SumUp Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
import { isEmpty, isFunction } from 'lodash/fp';
import {
  childrenPropType,
  childrenRenderPropType
} from '../../util/shared-prop-types';

import useComponentSize from './hooks/use-component-size';
import Container from './components/Container';
import Slides from './components/Slides';
import Slide from './components/Slide';
import SlideImage from './components/SlideImage';
import Controls from './components/Controls';
import Status from './components/Status';
import Progress from './components/Progress';
import Buttons from './components/Buttons';
import Step from '../Step';

import {
  ASPECT_RATIO,
  ANIMATION_DURATION,
  SLIDE_DURATION,
  SLIDE_DIRECTIONS
} from './constants';

const { ButtonList, NextButton, PrevButton, PlayButton } = Buttons;

const statusAlignment = ({ theme }) => css`
  flex: none;
  margin-right: ${theme.spacings.exa};

  ${theme.mq.untilKilo} {
    margin-right: ${theme.spacings.kilo};
  }
`;
const StyledStatus = styled(Status)(statusAlignment);

const progressAlignment = css`
  flex: 1 1 auto;
`;
const StyledProgress = styled(Progress)(progressAlignment);

const buttonsAlignment = ({ theme }) => css`
  margin-left: ${theme.spacings.exa};

  ${theme.mq.untilKilo} {
    margin-left: ${theme.spacings.kilo};
  }
`;
const StyledButtonList = styled(ButtonList)(buttonsAlignment);

const Carousel = ({
  slides,
  slideDuration,
  animationDuration,
  aspectRatio,
  children,
  cycle,
  autoPlay,
  hideControls,
  getAriaLabelledBy,
  ...props
}) => {
  const slidesTotal = slides.length;
  const slidesRef = useRef(null);
  const slideSize = useComponentSize(slidesRef);
  const [slideDirection, setSlideDirection] = useState();

  if (isEmpty(slides)) {
    return null;
  }

  const handleNextSlide = () => setSlideDirection(SLIDE_DIRECTIONS.FORWARD);
  const handlePreviousSlide = () => setSlideDirection(SLIDE_DIRECTIONS.BACK);

  return (
    <Step
      cycle={cycle}
      autoPlay={autoPlay}
      totalSteps={slidesTotal}
      stepDuration={slideDuration}
      animationDuration={animationDuration}
      onNext={handleNextSlide}
      onPrevious={handlePreviousSlide}
    >
      {({
        state,
        actions,
        getNextControlProps,
        getPreviousControlProps,
        getPlayControlProps,
        getPauseControlProps
      }) => (
        <Container aria-label="gallery" {...props}>
          <Slides ref={slidesRef}>
            {slides.map((slide, index) => (
              <Slide
                key={index}
                index={index}
                step={state.step}
                prevStep={state.previousStep}
                slideSize={slideSize}
                slideDirection={slideDirection}
                animationDuration={animationDuration}
              >
                <SlideImage
                  src={slide.image.src}
                  alt={slide.image.alt}
                  aspectRatio={aspectRatio}
                  aria-labelledby={getAriaLabelledBy(slide, index)}
                />
              </Slide>
            ))}
          </Slides>

          {!hideControls && (
            <Controls>
              <StyledStatus step={state.step} total={slidesTotal} />

              <StyledProgress
                key={state.step}
                paused={state.paused}
                animationDuration={state.stepDuration + state.animationDuration}
              />

              <StyledButtonList>
                <PlayButton
                  paused={state.paused}
                  {...(state.paused
                    ? getPlayControlProps()
                    : getPauseControlProps())}
                />
                <PrevButton {...getPreviousControlProps()} />
                <NextButton {...getNextControlProps()} />
              </StyledButtonList>
            </Controls>
          )}

          {isFunction(children) ? children({ state, actions }) : children}
        </Container>
      )}
    </Step>
  );
};

Carousel.propTypes = {
  /**
   * List of slides to be rendered in a carousel.
   */
  slides: PropTypes.arrayOf(
    PropTypes.shape({
      image: PropTypes.object.isRequired
    })
  ),
  /**
   * Indicates duration of animation between slides (in milliseconds).
   */
  animationDuration: PropTypes.number,
  /**
   * Indicates time how long each slide will stay visible (in milliseconds).
   */
  slideDuration: PropTypes.number,
  /**
   * Slide image aspect ratio.
   */
  aspectRatio: PropTypes.number,
  /**
   * Indicates if carousel should start again after last slide.
   */
  cycle: PropTypes.bool,
  /**
   * Make carousel playing immediately after load.
   */
  autoPlay: PropTypes.bool,
  /**
   * Optionally remove carousel controls bar under a slide.
   */
  hideControls: PropTypes.bool,
  /**
   * Label slide image by returning id string value of a label component (required for accessibility).
   */
  getAriaLabelledBy: PropTypes.func,
  /**
   * Add additional components inside a carousel.
   */
  children: PropTypes.oneOfType([childrenPropType, childrenRenderPropType])
};

Carousel.defaultProps = {
  slides: [],
  animationDuration: ANIMATION_DURATION,
  slideDuration: SLIDE_DURATION,
  aspectRatio: ASPECT_RATIO,
  cycle: true,
  autoPlay: true,
  getAriaLabelledBy: () => {}
};

export default Carousel;
