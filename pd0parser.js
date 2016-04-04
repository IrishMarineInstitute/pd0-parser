function pd0parser() {
  var m = this, struct = new BufferPack();
  //TODO: extract buffepack and use npm.
   m.unpack_bytes = function(pd0_bytes, data_format_tuples, offset){
     if(offset === undefined){
       offset = 0;
     }
     var data = {};
     for(var i=0,l=data_format_tuples.length; i<l; i++){
       var fmt = data_format_tuples[i];
       var struct_offset = -1;
       var size = 0;
        try{

            struct_offset = offset+fmt[2];
            size = struct.calcLength(fmt[1]);
            var data_bytes = pd0_bytes.subarray(struct_offset, struct_offset+size);
            data[fmt[0]] = struct.unpack(fmt[1], data_bytes)[0];
            //data[fmt[0]] = [struct.unpack(fmt[1],pd0_bytes,struct_offset)[0]]
        }
        catch(err){
            console.log('Error parsing '+fmt[0]+' with the arguments '
            +fmt[1]+", offset:"+struct_offset+" size:"+size);
            console.log(err);
        }
    }
    return data;
  };


   m.parse_fixed_header = function(pd0_bytes){
     var header_data_format = [
        ['id', 'B', 0],
        ['data_source', 'B', 1],
        ['number_of_bytes', '<H', 2],
        ['spare', 'B', 4],
        ['number_of_data_types', 'B', 5]
     ];

        return m.unpack_bytes(pd0_bytes, header_data_format);
    };


    m.parse_address_offsets = function(pd0_bytes, num_datatypes, offset){
      if(offset === undefined){
        offset = 6;
      }
      var address_data = [];
      for(var bytes_start=offset, l = offset+(num_datatypes * 2); bytes_start<l; bytes_start += 2){
        var data = struct.unpack('<H',pd0_bytes.subarray(bytes_start, bytes_start+2))[0];
        address_data.push(data)
      }
      return address_data
    };

    m.parse_fixed_leader = function(pd0_bytes, offset, data){
    var fixed_leader_format = [
              ['id', '<H', 0],
              ['cpu_firmware_version', 'B', 2],
              ['cpu_firmware_revision', 'B', 3],
              ['system_configuration', 'B', 5],
              ['simulation_data_flag', 'B', 6],
              ['lag_length', 'B', 7],
              ['number_of_beams', 'B', 8],
              ['number_of_cells', 'B', 9],
              ['pings_per_ensemble', '<H', 10],
              ['depth_cell_length', '<H', 12],
              ['blank_after_transmit', '<H', 14],
              ['signal_processing_mode', 'B', 16],
              ['low_correlation_threshold', 'B', 17],
              ['number_of_code_repetitions', 'B', 18],
              ['minimum_percentage_water_profile_pings', 'B', 19],
              ['error_velocity_threshold', '<H', 20],
              ['minutes', 'B', 22],
              ['seconds', 'B', 23],
              ['hundredths', 'B', 24],
              ['coordinate_transformation_process', 'B', 25],
              ['heading_alignment', '<H', 26],
              ['heading_bias', '<H', 28],
              ['sensor_source', 'B', 30],
              ['sensor_available', 'B', 31],
              ['bin_1_distance', '<H', 32],
              ['transmit_pulse_length', '<H', 34],
              ['starting_depth_cell', 'B', 36],
              ['ending_depth_cell', 'B', 37],
              ['false_target_threshold', 'B', 38],
              ['spare', 'B', 39],
              ['transmit_lag_distance', '<H', 40],
              ['cpu_board_serial_number', '<Q', 42],
              ['system_bandwidth', '<H', 50],
              ['system_power', 'B', 52],
              ['spare', 'B', 53],
              ['serial_number', '<I', 54],
              ['beam_angle', 'B', 58]
            ];

    return m.unpack_bytes(pd0_bytes, fixed_leader_format, offset);
}

 m.parse_variable_leader = function(pd0_bytes, offset, data){
    var variable_leader_format = [
      ['id', '<H', 0],
      ['ensemble_number', '<H', 2],
      ['rtc_year', 'B', 4],
      ['rtc_month', 'B', 5],
      ['rtc_day', 'B', 6],
      ['rtc_hour', 'B', 7],
      ['rtc_minute', 'B', 8],
      ['rtc_second', 'B', 9],
      ['rtc_hundredths', 'B', 10],
      ['ensemble_roll_over', 'B', 11],
      ['bit_result', '<H', 12],
      ['speed_of_sound', '<H', 14],
      ['depth_of_transducer', '<H', 16],
      ['heading', '<H', 18],
      ['pitch', '<h', 20],
      ['roll', '<h', 22],
      ['salinity', '<H', 24],
      ['temperature', '<h', 26],
      ['mpt_minutes', 'B', 28],
      ['mpt_seconds', 'B', 29],
      ['mpt_hundredths', 'B', 30],
      ['heading_standard_deviation', 'B', 31],
      ['pitch_standard_deviation', 'B', 32],
      ['roll_standard_deviation', 'B', 33],
      ['transmit_current', 'B', 34],
      ['transmit_voltage', 'B', 35],
      ['ambient_temperature', 'B', 36],
      ['pressure_positive', 'B', 37],
      ['pressure_negative', 'B', 38],
      ['attitude_temperature', 'B', 39],
      ['attitude', 'B', 40],
      ['contamination_sensor', 'B', 41],
      ['error_status_word', '<I', 42],
      ['reserved', '<H', 46],
      ['pressure', '<I', 48],
      ['pressure_variance', '<I', 52],
      ['spare', 'B', 56],
      ['rtc_y2k_century', 'B', 57],
      ['rtc_y2k_year', 'B', 58],
      ['rtc_y2k_month', 'B', 59],
      ['rtc_y2k_day', 'B', 60],
      ['rtc_y2k_hour', 'B', 61],
      ['rtc_y2k_minute', 'B', 62],
      ['rtc_y2k_seconds', 'B', 63],
      ['rtc_y2k_hundredths', 'B', 64]
    ];

    var variable_data = m.unpack_bytes(pd0_bytes, variable_leader_format, offset);
    if(variable_data['rtc_y2k_century'] === undefined){
      data['timestamp'] = Date.UTC(
          variable_data['rtc_year'] + 2000,
          variable_data['rtc_month'] -1,
          variable_data['rtc_day'],
          variable_data['rtc_hour'],
          variable_data['rtc_minute'],
          variable_data['rtc_second'],
          variable_data['rtc_hundredths']*10
        );
    }else{
      data['timestamp'] = Date.UTC(
          variable_data['rtc_y2k_year'] + variable_data['rtc_y2k_century'] * 100,
          variable_data['rtc_y2k_month'] -1,
          variable_data['rtc_y2k_day'],
          variable_data['rtc_y2k_hour'],
          variable_data['rtc_y2k_minute'],
          variable_data['rtc_y2k_second'],
          variable_data['rtc_y2k_hundredths']*10
        );
  }
    return variable_data;
  };


  m.parse_per_cell_per_beam = function(pd0_bytes, offset,
                            number_of_cells, number_of_beams,
                            struct_format, debug){
    /*
    Parses fields that are stored in serial cells and beams
    structures.
    Returns an array of cell readings where each reading is an
    array containing the value at that beam.
    */
    if(debug === undefined){
      debug = false;
    }

    var data_size = struct.calcLength(struct_format);
    var data = [];
    for(var cell=0; cell < number_of_cells; cell++){
        var cell_start = offset + cell*number_of_beams*data_size;
        var cell_data = [];
        for( var field=0; field < number_of_beams; field++){
            var field_start = cell_start + field*data_size;
            var data_bytes = pd0_bytes.subarray(field_start, field_start+data_size);
            field_data = struct.unpack(struct_format,data_bytes)[0];

            if(debug){
                console.log('Bytes: ', data_bytes, ', Data:', field_data);
              }
            cell_data.push(field_data);
        }
        data.push(cell_data);
    }
    return data;
  };


  m.parse_velocity = function(pd0_bytes, offset, data){
    var velocity_format = [
        ['id', '<H', 0]
    ];

    var velocity_data = m.unpack_bytes(pd0_bytes, velocity_format, offset);
    offset += 2;//  # Move past id field
    velocity_data['data'] = m.parse_per_cell_per_beam(
        pd0_bytes,
        offset,
        data['fixed_leader']['number_of_cells'],
        data['fixed_leader']['number_of_beams'],
        '<h'
    );

    return velocity_data;
  };


  m.parse_correlation = function(pd0_bytes, offset, data){
    var correlation_format = [
        ['id', '<H', 0]
    ];

    var correlation_data = m.unpack_bytes(pd0_bytes, correlation_format, offset);
    offset += 2;
    correlation_data['data'] = m.parse_per_cell_per_beam(
        pd0_bytes,
        offset,
        data['fixed_leader']['number_of_cells'],
        data['fixed_leader']['number_of_beams'],
        'B'
    );

    return correlation_data;
  };

 m.parse_echo_intensity = function(pd0_bytes, offset, data){
   var echo_intensity_format = [
        ['id', '<H', 0]
    ];

    var echo_intensity_data = m.unpack_bytes(pd0_bytes,
                                       echo_intensity_format, offset);
    offset += 2;
    echo_intensity_data['data'] = m.parse_per_cell_per_beam(
        pd0_bytes,
        offset,
        data['fixed_leader']['number_of_cells'],
        data['fixed_leader']['number_of_beams'],
        'B'
    );

    return echo_intensity_data;
  };

 m.parse_percent_good = function(pd0_bytes, offset, data){
    var percent_good_format = [
        ['id', '<H', 0]
    ];

    var percent_good_data = m.unpack_bytes(pd0_bytes, percent_good_format, offset);
    offset += 2;
    percent_good_data['data'] = m.parse_per_cell_per_beam(
        pd0_bytes,
        offset,
        data['fixed_leader']['number_of_cells'],
        data['fixed_leader']['number_of_beams'],
        'B'
    );

    return percent_good_data;
  };


m.parse_status = function(pd0_bytes, offset, data){
    var status_format = [
        ['id', '<H', 0]
    ];

    var status_data = m.unpack_bytes(pd0_bytes, status_format, offset);
    offset += 2;
    status_data['data'] = m.parse_per_cell_per_beam(
        pd0_bytes,
        offset,
        data['fixed_leader']['number_of_cells'],
        data['fixed_leader']['number_of_beams'],
        'B'
    );

    return status_data;
  };


m.parse_bottom_track = function(pd0_bytes, offset, data){
    var bottom_track_format = [
      ['id', '<H', 0],
      ['pings_per_ensemble', '<H', 2],
      ['delay_before_reaquire', '<H', 4],
      ['correlation_magnitude_minimum', 'B', 6],
      ['evaluation_amplitude_minimum', 'B', 7],
      ['percent_good_minimum', 'B', 8],
      ['bottom_track_mode', 'B', 9],
      ['error_velocity_maximum', '<H', 10]
    ];

    bottom_track_data, data_size = unpack_bytes(pd0_bytes,
                                                bottom_track_format, offset)
    offset += data_size;
    // Plan to implement as needed
    throw "Not Implemented";
 };


m.validate_checksum = function(pd0_bytes, offset){
    var calc_checksum = pd0_bytes.subarray(0,offset).reduce(function(a, b) { return a + b; }) & 0xFFFF;
    var given_checksum = struct.unpack('<H', pd0_bytes.subarray(offset, offset+2))[0];

    if(calc_checksum != given_checksum){
        throw "Checksum Error. Calculated "+calc_checksum+", Given: "+given_checksum;
    }
  };


 m.output_data_parsers = {
   0x0000: ['fixed_leader', m.parse_fixed_leader],
   0x0080: ['variable_leader', m.parse_variable_leader],
   0x0100: ['velocity', m.parse_velocity],
   0x0200: ['correlation', m.parse_correlation],
   0x0300: ['echo_intensity', m.parse_echo_intensity],
   0x0400: ['percent_good', m.parse_percent_good],
   0x0500: ['status', m.parse_status],
   0x0600: ['bottom_track', m.parse_bottom_track]
};
/**
 * Returns a promise to parse the bytes.
 */
m.parse = function(pd0_bytes,cb,parsed_pd0s){
  return new Promise(function(resolve,reject){
      var parsed_pd0s = [];
      m.__parse(pd0_bytes,resolve,reject,parsed_pd0s);
  });
};

m.__parse = function(pd0_bytes,resolve,reject,parsed_pd0s){
  try{
    /*
    This is the main parsing loop. It uses output_data_parsers
    to determine what funcitons to run given a specified offset and header
    ID at that offset.
    Returns a dictionary of values parsed out into javascript types.
    */
    if(pd0_bytes.length === 0){
      resolve(parsed_pd0s);
      return;
    }

    var data = {};

    // Read in header
    data['header'] = m.parse_fixed_header(pd0_bytes);

    // Run checksum
    m.validate_checksum(pd0_bytes, data['header']['number_of_bytes']);

    data['header']['address_offsets'] =
        m.parse_address_offsets(pd0_bytes,
                              data['header']['number_of_data_types']);

    for(var i=0,l=data['header']['address_offsets'].length;i<l;i++){
        var offset = data['header']['address_offsets'][i];
        var header_id = struct.unpack('<H', pd0_bytes.subarray(offset, offset+2))[0];
        if(m.output_data_parsers[header_id] !== undefined){
            var key = m.output_data_parsers[header_id][0];
            var parser = m.output_data_parsers[header_id][1];
            data[key] = parser(pd0_bytes, offset, data);
        }else{
            console.log('No parser found for header ' +header_id);
        }
    }

    parsed_pd0s.push(data);
    pd0_bytes = pd0_bytes.subarray(data['header']['number_of_bytes']+2)
    var nextjob = function(){
        m.__parse(pd0_bytes,resolve,reject,parsed_pd0s);
    }
    setTimeout(nextjob,0);
  }
  catch(err){
    reject(err);
  }
  };
};

(function(){
var loadscript = function(src){
  console.log("pd0parser loading script "+src);
 var script = document.createElement('script');
 script.type = 'text/javascript';
 script.async = true;
 script.src = src;
 document.getElementsByTagName('head')[0].appendChild(script);
};
if (typeof fetch != 'function') {
  loadscript("https://cdnjs.cloudflare.com/ajax/libs/fetch/0.10.1/fetch.min.js");
}
if (typeof BufferPack != 'function') {
  loadscript("bufferpack.js");
}
})();
