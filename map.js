'use strict';
// @import url('./map.css');
(function($) {
	var options = {
		inputBox: '',
		emChart: null,
		option: null,
		nationwideData: null,
		contrastData: null,
		showRegionsList: false,
		callback: function() {}
	}

	$.fn.extend({
		EMChoose: function(opt) {
			opt = opt || {};
			options = $.extend(options, opt);
			var frame = initContainer();
			$('body').append(frame);
			initMap();
			if (options.showRegionsList) {
				showRegionsList();

			}
			$('#lh_close').on('click', removeMap);

		}
	})

	function showRegionsList() {
		var ipts = addIpts();
		$('#lh_header').append(ipts);
		$('.lh-ipt-city').on('input', function() {
			var keyword = $(this).val();
			var dataArr = findRelatedPlace(keyword);
			var sortedDataArr = sortPlace(dataArr);
			var lis = showRelatedPlace(sortedDataArr);
			$('.lh-ipt-related').html('').slideDown().html(lis);
			$('.lh-ipt-related').find('li').on('click', function() {
				$('.lh-ipt-related').slideUp();
				var checkedPlace = $(this).html();
				var placeType = getCityType(checkedPlace);
				if (placeType == 'prov') {
					var provName = checkedPlace;
					var myChart = options.emChart;
					var option = setMapOption();
					if (provName == '台湾' || provName == '香港' || provName == '澳门') {
						alert('业务拓展中，敬请期待')
						return false;
					}
					myChart = echarts.init(document.getElementById('lh_content'));
					option.series[0].mapType = provName;
					option.series[0].mapLocation.width = '40%';
					option.series[0].mapLocation.x = 'left';
					createRegionsList(provName);
					myChart.on(echarts.config.EVENT.CLICK, function(data) {
						options.callback(getJSON(data.name));
						removeMap();
					})
					$('.lh-tit').html(provName);
					myChart.setOption(option, true);
				} else {
					var shortName = getShortPlace(checkedPlace);
					if (shortName == '台湾' || shortName == '香港' || shortName == '澳门') {
						alert('业务拓展中，敬请期待')
						return false;
					}
					options.callback(getJSON(shortName));
					removeMap();
				}
			})
		})
		$('.lh-ipt-city').on('blur', function() {
			$('.lh-ipt-related').slideUp();
		})
		$('.lh-btn-search').on('click', function() {
			$('.lh-ipt-related').slideToggle();
		})
		$('.lh-btn-nation').on('click', function() {
			options.callback(getJSON('全国'));
			removeMap();
		})
	}

	function getCityType(cityName) {
		var times = (cityName.split('-')).length - 1;
		if (times == 0) {
			return 'prov';
		} else if (times == 1) {
			return 'city';
		} else if (times == 2) {
			return 'county';
		}
	}

	function getShortPlace(cityName) {
		var citySplit = cityName.split('-');
		var len = citySplit.length;
		return citySplit[len - 1];
	}

	function initContainer() {
		var htmls = [];
		htmls.push('<div id="lh_bg"></div>');
		htmls.push('<div id="lh_main">');
		htmls.push('<div id="lh_header">');
		htmls.push('<h2 class="lh-tit">请选择省份</h2>');
		htmls.push('</div>');
		htmls.push('<div id="lh_content">');
		htmls.push('</div>');
		htmls.push('<span id="lh_close"></span>');
		htmls.push('</div>');
		return htmls.join('');
	}

	function addIpts() {
		var divs = [];
		divs.push('<div class="lh-ipt">');
		divs.push('<input type="text" placeholder="请输入您要搜索的城市" class="lh-ipt-city" >');
		divs.push('<input type="button" value="搜索" class="lh-btn-search" >');
		divs.push('<input type="button" value="全国" class="lh-btn-nation" >');
		divs.push('<ul class="lh-ipt-related"></ul>');
		divs.push('</div>');
		return divs.join('');
	}

	function setMapOption() {
		var option = {
			tooltip: {
				trigger: 'item',
				formatter: '{b}'
			},
			series: [{
				type: 'map',
				mapType: 'china',
				itemStyle: {
					normal: {
						label: {
							show: true
						}
					},
					emphasis: {
						label: {
							show: true
						}
					}
				},
				mapLocation: {
					x: 'center',
					y: 'center',
					width: '100%'
				},
				data: []
			}]
		}
		return option;
	}

	function initMap() {
		var myChart = options.emChart;
		var option = setMapOption();
		myChart = echarts.init(document.getElementById('lh_content'));
		myChart.setOption(option);
		myChart.on(echarts.config.EVENT.CLICK, function(data) {
			if (option.series[0].mapType == 'china') {
				var provName = data.name;
				if (provName == '台湾' || provName == '香港' || provName == '澳门') {
					alert('业务拓展中，敬请期待')
					return false;
				}
				option.series[0].mapType = provName;
				if (options.showRegionsList) {
					option.series[0].mapLocation.width = '40%';
					option.series[0].mapLocation.x = 'left';
					createRegionsList(provName);
				}
				$('.lh-tit').html(provName);
				myChart.setOption(option, true);
			} else {
				options.callback(getJSON(data.name))
				removeMap();
			}
		})
	}

	function removeMap() {
		$('#lh_main').remove();
		$('#lh_bg').remove();
	}

	function getJSON(place) {
		var cityName = place;
		var json = {
			"id": "",
			"name": "",
			"cityType": "",
			"pinyin": ""
		}
		var prov = contrastData;
		for (var i = 0; i < prov.length; i++) {
			if (prov[i].name == cityName) {
				json.id = prov[i].id;
				json.name = prov[i].name;
				json.cityType = prov[i].cityType;
				json.pinyin = prov[i].pinyin;
			} else {
				var city = prov[i].children;
				for (var j = 0; j < city.length; j++) {
					if (city[j].name == cityName) {
						json.id = city[j].id;
						json.name = city[j].name;
						json.cityType = city[j].cityType;
						json.pinyin = city[j].pinyin;
					} else {
						var county = city[j].children;
						for (var k = 0; k < county.length; k++) {
							if (county[k].name == cityName) {
								json.id = county[k].id;
								json.name = county[k].name;
								json.cityType = county[k].cityType;
								json.pinyin = county[k].pinyin;
							}
						}
					}
				}
			}
		}
		return json;
	}

	function createRegionsList(provName) {
		var regionsList = '<div id="lh_regionsList"></div>';
		$('#lh_content').append(regionsList);
		var provId = getProvId(provName);
		var tarProv = options.contrastData[provId];
		var city = tarProv.children;
		for (var i = 0; i < city.length; i++) {
			var aDl = document.createElement('dl');
			var aDt = document.createElement('dt');
			var aDd = document.createElement('dd');
			aDt.innerHTML = city[i].name;
			aDl.appendChild(aDt);
			var county = city[i].children;
			for (var j = 0; j < county.length; j++) {
				var aA = document.createElement('a');
				aA.href = 'javascript:;'
				aA.innerHTML = county[j].name;
				aDd.appendChild(aA);
				aDl.appendChild(aDd);
				$('#lh_regionsList').append(aDl);
			}
		}
		$('#lh_regionsList').on('click', 'dt,a', function() {
			var targetPlace = $(this).html();
			options.callback(getJSON(targetPlace));
			removeMap();
		})
	}

	function getProvId(provName) {
		var provArr = [];
		for (var i = 0; i < options.contrastData.length; i++) {
			provArr.push(options.contrastData[i].name);
		}
		var provId = provArr.findIndex(function(val, i) {
			return val == provName;
		})
		return provId;
	}

	function showRelatedPlace(dataArr) {
		var lis = '';
		for (var i = 0; i < dataArr.length; i++) {
			lis += '<li>' + dataArr[i] + '</li>';
		}
		return lis;
	}

	function findRelatedPlace(keyword) {
		var shortName = allAreaBasic();
		var longName = allAreaDetail();
		var keyAboutIndex = [];
		var keyAboutPlace = [];
		for (var i = 0; i < shortName.length; i++) {
			if (shortName[i].indexOf(keyword, 0) != -1) {
				keyAboutIndex.push(i);
			}
		}
		for (var j = 0; j < keyAboutIndex.length; j++) {
			keyAboutPlace.push(longName[keyAboutIndex[j]])
		}
		return keyAboutPlace;
	}

	function sortPlace(placeArr) {
		var prov = [];
		var city = [];
		var county = [];
		for (var o = 0; o < placeArr.length; o++) {
			var str = placeArr[o];
			var times = (str.split('-')).length - 1;
			if (times == 0) {
				prov.push(placeArr[o]);
			} else if (times == 1) {
				city.push(placeArr[o]);
			} else {
				county.push(placeArr[o]);
			}
		}
		var newPlaceArr = prov.concat(city, county);
		return newPlaceArr;
	}

	function allAreaDetail() {
		var allAreaDetail = [];
		var prov = options.contrastData;
		for (var i = 0; i < prov.length; i++) {
			allAreaDetail.push(prov[i].name);
			var city = prov[i].children;
			for (var j = 0; j < city.length; j++) {
				allAreaDetail.push(prov[i].name + '-' + city[j].name);
				var county = city[j].children;
				for (var k = 0; k < county.length; k++) {
					allAreaDetail.push(prov[i].name + '-' + city[j].name + '-' + county[k].name);
				}
			}
		}
		return allAreaDetail;
	}

	function allAreaBasic() {
		var allAreaBasic = [];
		var prov = options.contrastData;
		for (var i = 0; i < prov.length; i++) {
			allAreaBasic.push(prov[i].name);
			var city = prov[i].children;
			for (var j = 0; j < city.length; j++) {
				allAreaBasic.push(city[j].name);
				var county = city[j].children;
				for (var k = 0; k < county.length; k++) {
					allAreaBasic.push(county[k].name);
				}
			}
		}
		return allAreaBasic;
	}

	options.nationwideData = nationwideData;
	options.contrastData = contrastData;
})(window.jQuery)

function EMChoose() {}
EMChoose.prototype.ddChuli = function(provName, cityJson) {
	var cityList = cityJson.features;
	for (var i = 0; i < cityList.length; i++) {
		var city = cityList[i];
		var proList = nationwideData[provName];
		for (var j = 0; j < proList.length; j++) {
			var pro = proList[j];
			if (city.properties.name.indexOf(pro.name) !== -1 || pro.name == city.properties.name) {
				cityJson.features[i].properties.name = pro.name.replace(/地区/, '');
				break;
			}
		}
	}
	return cityJson;
}