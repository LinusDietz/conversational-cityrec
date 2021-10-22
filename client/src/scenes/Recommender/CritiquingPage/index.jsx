import React from 'react';
import { CenteredContainer } from '../styles';
import ScoreCritiquer from './ScoreCritiquer';
import CityDetailsPane from "../CritiquingPage/CityDetailsPane";




class CritiquingPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentAspectIndex: 0
    };
    this.myRef = React.createRef();
  }

  componentDidMount() {
    const { shouldResetRecommenderProgress, resetRecommenderProgress } = this.props;
    if (shouldResetRecommenderProgress()) {
      resetRecommenderProgress();
    }
    this.scroll(this.myRef);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.scroll(this.myRef);
  }

  scroll(ref) {
    ref.current.scrollTo(0, 0);
  }

  render() {
    const { cities, statistics, isLoading, onNextStepClick, onCritiqueClick } = this.props;

    let critiques = [];

    if (typeof cities === 'undefined' || cities.length === 0){
      critiques = [{currentRecommendation: true, name: ''}];
    }
    else{
      critiques = cities;
    }
    return (
      <div ref={this.myRef}>
      <CenteredContainer>
      <div style={{width: "50%", margin: "0 auto"}}>
      We have computed this recommendation based on your previous choices, but we are not entirely sure if this is actually the city you would potentially like to visit.<br />
      In this step, you can explore the aspects of several cities in comparison to your current recommendation. You can now decide whether you want to refine your recommendation to give the system more information about what kind of city you like.
      </div>
          <CityDetailsPane city={cities[0] || {}}  maxSimilarity={10} isLoading={isLoading}/>
          <div className="row" style={{'marginTop': '30px'}}><ScoreCritiquer cities={critiques} statistics={statistics || {}} onFinish={onNextStepClick} onCritiqueClick={onCritiqueClick} isLoading={isLoading}/></div>
      </CenteredContainer>
      </div>
    );
  }
}

export default CritiquingPage;