import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import * as appPropTypes from './appPropTypes';
import { Appear } from './transitions';
import Peer from './Peer';

const Peers = ({ peers, activeSpeakerId, singleAudioConsumer }) =>
{
	const audioRef = React.useRef();

	React.useEffect(() => {
		if (!singleAudioConsumer || !audioRef.current) {
			return;
		}
		const stream = new MediaStream([singleAudioConsumer.track]);

		audioRef.current.srcObject = stream;

		audioRef.current.play()
			.catch((error) => logger.warn('audioElem.play() failed:%o', error));

		return () => {
			if (audioRef.current) {
				audioRef.current.srcObject = null;
			}
		}
	}, [singleAudioConsumer, audioRef]);

	return (
		<div data-component='Peers'>
			{
				peers.map((peer) =>
				{
					return (
						<Appear key={peer.id} duration={1000}>
							<div
								className={classnames('peer-container', {
									'active-speaker' : peer.id === activeSpeakerId
								})}
							>
								<Peer id={peer.id} />
							</div>
						</Appear>
					);
				})
			}

			<audio
				ref={audioRef}
				autoPlay
				playsInline
				muted={false}
				controls={false}
			/>

		</div>
	);
};

Peers.propTypes =
{
	peers           : PropTypes.arrayOf(appPropTypes.Peer).isRequired,
	activeSpeakerId : PropTypes.string,
	singleAudioProducer : PropTypes.string,
	singleAudioProducerPeerId  : PropTypes.string,
	singleAudioConsumer    : appPropTypes.Consumer
};

const mapStateToProps = (state) =>
{
	const peersArray = Object.values(state.peers);

	let singleAudioConsumer = null;
	if (state.room.singleAudioProducer) {
		for (const peer of peersArray)
		{
			const consumersArray = peer.consumers
				.map((consumerId) => state.consumers[consumerId]);
			singleAudioConsumer =
				consumersArray.find((consumer) => consumer.track.kind === 'audio');

			if (singleAudioConsumer) {
				break;
			}
		}
	}

	return {
		peers           : peersArray,
		activeSpeakerId : state.room.activeSpeakerId,
		singleAudioProducer : state.room.singleAudioProducer,
		singleAudioProducerPeerId : state.room.singleAudioProducerPeerId,
		singleAudioConsumer
	};
};

const PeersContainer = connect(
	mapStateToProps,
	null,
	null,
	{
		areStatesEqual : (next, prev) =>
		{
			return (
				prev.peers === next.peers &&
				prev.room.activeSpeakerId === next.room.activeSpeakerId &&
				prev.room.singleAudioProducer === next.room.singleAudioProducer
			);
		}
	}
)(Peers);

export default PeersContainer;
