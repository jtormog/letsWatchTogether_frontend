'use client';

import SocialIcon from '@/icons/SocialIcon';
import React, { useState } from 'react';

const exampleRecommendations = [
	{
		media: {
			title: 'Stranger Things',
			description:
				'Cuando un niño desaparece, un pequeño pueblo descubre un misterio que involucra experimentos secretos, fuerzas sobrenaturales y una extraña niña.',
			backgroundImage:
				'https://placehold.co/1920x1080/FF5733/FFFFFF?text=Stranger+Things',
		},
		recommendator: {
			userName: 'Jesús Cristo',
			profileImage:
				'https://placehold.co/100x100/CCCCCC/333333?text=JC',
		},
	},
	{
		media: {
			title: 'Breaking Bad',
			description:
				'Un profesor de química con cáncer terminal se asocia con un exalumno para fabricar y vender metanfetamina para asegurar el futuro financiero de su familia.',
			backgroundImage:
				'https://placehold.co/1920x1080/33FF57/000000?text=Breaking+Bad',
		},
		recommendator: {
			userName: 'Walter White',
			profileImage:
				'https://placehold.co/100x100/0077BE/FFFFFF?text=WW',
		},
	},
	{
		media: {
			title: 'Game of Thrones',
			description:
				'Nobles familias luchan por el control de los Siete Reinos mientras antiguas amenazas emergen desde más allá del colosal muro que protege el norte.',
			backgroundImage:
				'https://placehold.co/1920x1080/3357FF/FFFFFF?text=Game+of+Thrones',
		},
		recommendator: {
			userName: 'Jon Snow',
			profileImage:
				'https://placehold.co/100x100/333333/FFFFFF?text=JS',
		},
	},
	{
		media: {
			title: 'The Witcher',
			description:
				'Un cazador de monstruos genéticamente modificado lucha por encontrar su lugar en un mundo donde las personas a menudo son más malvadas que las bestias.',
			backgroundImage:
				'https://placehold.co/1920x1080/FF33A8/FFFFFF?text=The+Witcher',
		},
		recommendator: {
			userName: 'Geralt de Rivia',
			profileImage:
				'https://placehold.co/100x100/9A9A9A/FFFFFF?text=GR',
		},
	},
	{
		media: {
			title: 'The Mandalorian',
			description:
				'Un cazarrecompensas solitario viaja a los confines de la galaxia, lejos de la autoridad de la Nueva República, después de la caída del Imperio.',
			backgroundImage:
				'https://placehold.co/1920x1080/A833FF/FFFFFF?text=The+Mandalorian',
		},
		recommendator: {
			userName: 'Din Djarin',
			profileImage:
				'https://placehold.co/100x100/4A4A4A/FFFFFF?text=DD',
		},
	},
];

export default () => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const currentSeries = exampleRecommendations[currentIndex];
	
	const processDescription = (text) => {
		if (!text) return '';
		const maxLength = 150;
		if (text.length <= maxLength) return text;
		
		const truncated = text.substring(0, maxLength);
		const lastSpace = truncated.lastIndexOf(' ');
		
		return truncated.substring(0, lastSpace) + '...';
	};

	const handlePrevious = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex === 0 ? exampleRecommendations.length - 1 : prevIndex - 1
		);
	};

	const handleNext = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex === exampleRecommendations.length - 1 ? 0 : prevIndex + 1
		);
	};

	return (
		<div className="self-stretch relative w-full h-0 pb-[43.75%]">
			<div className="w-full h-full absolute inset-0 flex flex-col justify-start items-start overflow-hidden">
				<img
					className="w-full h-full object-cover"
					src={currentSeries.media.backgroundImage}
				/>
			</div>
			<div className="w-full h-full absolute inset-0 bg-gradient-to-l from-color-blue-4 via-color-blue-4-20%/30 to-color-black-solid" />
			<div className="w-full h-full absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
			<div className="w-full h-full p-12 absolute inset-0 flex flex-col justify-between items-start">
				<div className="self-stretch pt-8 flex flex-col justify-start items-start">
					<div className="self-stretch inline-flex justify-start items-center">
						<div className="w-10 h-8 pr-2 inline-flex flex-col justify-start items-start">
							<div className="w-8 h-8 rounded-full inline-flex justify-center items-start overflow-hidden">
								<img
									src={currentSeries.recommendator.profileImage}
									alt={currentSeries.recommendator.userName}
									className="w-8 h-8 object-cover"
								/>
							</div>
						</div>
						<div
							data-hover="false"
							data-variant="1"
							className="px-2.5 py-[3px] bg-emerald-500 rounded-full flex justify-start items-center"
						>
							<div className="w-4 h-3 pr-1 inline-flex flex-col justify-start items-start">
								<div className="w-3 h-3 flex flex-col justify-center items-center">
									<div
										data-variant="2"
										className="w-full h-full flex items-center justify-center overflow-visible"
									>
										<SocialIcon className="w-3 h-3" />
									</div>
								</div>
							</div>
							<div className="justify-center text-color-grey-7 text-xs font-semibold font-['Inter'] leading-none">
								{currentSeries.recommendator.userName} quiere ver{' '}
							</div>
						</div>
					</div>
				</div>
				<div className="w-full flex flex-col justify-start items-start gap-3">
					<div className="self-stretch flex flex-col justify-start items-start">
						<div className="self-stretch justify-start text-color-white-solid text-6xl font-bold font-['Inter'] leading-[60px]">
							{currentSeries.media.title}
						</div>
					</div>
					<div className="self-stretch inline-flex justify-between items-center">
						<div
							data-hover="false"
							data-variant="1"
							className="p-1.5 bg-black/50 rounded-full inline-flex justify-center items-center cursor-pointer w-10 h-10"
							onClick={handlePrevious}
						>
							<span className="text-white text-lg">&lt;</span>
						</div>
						<div className="flex-1 flex justify-center items-center">
							<div className="flex justify-center items-center gap-2">
								{exampleRecommendations.map((_, index) => (
									<div key={index} className="inline-flex justify-center items-center">
										<div 
											className={`w-3 h-3 ${index === currentIndex ? "bg-emerald-500" : "bg-white/50"} rounded-full cursor-pointer transition-all duration-200 hover:bg-white/70`}
											onClick={() => setCurrentIndex(index)}
										/>
									</div>
								))}
							</div>
						</div>
						<div
							data-hover="false"
							data-variant="2"
							className="p-1.5 bg-black/50 rounded-full inline-flex justify-center items-center cursor-pointer w-10 h-10"
							onClick={handleNext}
						>
							<span className="text-white text-lg">&gt;</span>
						</div>
					</div>
					<div className="self-stretch pt-1 flex flex-col justify-start items-start overflow-hidden">
						<div className="self-stretch h-7 justify-start text-color-white-solid text-lg font-normal font-['Inter'] leading-7 overflow-hidden text-ellipsis whitespace-nowrap">
							{processDescription(currentSeries.media.description)}
						</div>
					</div>
					<div className="self-stretch pt-2 inline-flex justify-start items-start">
						<div
							data-hover="false"
							data-variant="1"
							className="h-10 px-4 py-2.5 bg-emerald-500 rounded-md flex justify-center items-center"
						>
							<div className="text-center justify-center text-color-grey-7 text-sm font-medium font-['Inter'] leading-tight">
								Ver con amigos
							</div>
						</div>
						<div className="h-10 pl-4 inline-flex flex-col justify-start items-start">
							<div
								data-hover="false"
								data-variant="2"
								className="h-10 px-4 py-2.5 bg-neutral-900 rounded-md outline outline-1 outline-offset-[-1px] outline-white inline-flex justify-center items-center"
							>
								<div className="text-center justify-center text-color-white-solid text-sm font-medium font-['Inter'] leading-tight">
									Ver detalles
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
