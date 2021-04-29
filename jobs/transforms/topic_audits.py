# coding: utf-8
#
# Copyright 2021 The Oppia Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Beam DoFns and PTransforms to provide validation of topic models."""

from __future__ import absolute_import  # pylint: disable=import-only-modules
from __future__ import unicode_literals  # pylint: disable=import-only-modules

import datetime

from core.platform import models
import feconf
from jobs import job_utils
from jobs.decorators import audit_decorators
from jobs.transforms import base_model_audits
from jobs.types import audit_errors

import apache_beam as beam

(topic_models,) = models.Registry.import_models([models.NAMES.topic])


@audit_decorators.AuditsExisting(topic_models.TopicModel)
class ValidateCanonicalNameMatchesNameInLowercase(beam.DoFn):
	"""DoFn to validate canonical name matching with lower case name"""

	def process(self, input_model):
		"""Function that validate that canonical name of the model is same as
		name of the model in lowercase.

		Args:
			item: datastore_services.Model. TopicModel to validate.
		
		Yields:
            ModelCanonicalNameMismatchError. An error class for
			name mismatched models.
		"""
		model = job_utils.clone_model(input_model)
		name = model.name
		if name.lower() != model.canonical_name:
			yield audit_errors.ModelCanonicalNameMismatchError(model)

