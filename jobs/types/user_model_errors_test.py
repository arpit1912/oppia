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

"""Unit tests for base model validator errors."""

from __future__ import absolute_import  # pylint: disable=import-only-modules
from __future__ import unicode_literals  # pylint: disable=import-only-modules

import datetime
import pickle

from core.platform import models
from core.tests import test_utils as core_test_utils
import feconf
from jobs import job_utils
from jobs.types import user_model_errors
from jobs.types import model_property
import python_utils

(base_models, user_models, topic_models) = models.Registry.import_models(
    [models.NAMES.base_model, models.NAMES.user, models.NAMES.topic])

datastore_services = models.Registry.import_datastore_services()


class FooModel(base_models.BaseModel):
    """A model with an id property targeting a BarModel."""

    bar_id = datastore_services.StringProperty()


class BarModel(base_models.BaseModel):
    """A model with a simple string property named "value"."""

    value = datastore_services.StringProperty()


class FooError(user_model_errors.BaseAuditError):
    """A simple test-only error."""

    def __init__(self, model):
        super(FooError, self).__init__(model)
        self.message = 'foo'


class BarError(user_model_errors.BaseAuditError):
    """A simple test-only error."""

    def __init__(self, model):
        super(BarError, self).__init__(model)
        self.message = 'bar'


class AuditErrorsTestBase(core_test_utils.TestBase):
    """Base class for validator error tests."""

    NOW = datetime.datetime.utcnow()
    YEAR_AGO = NOW - datetime.timedelta(weeks=52)
    YEAR_LATER = NOW + datetime.timedelta(weeks=52)


class ModelExpiringErrorTests(AuditErrorsTestBase):

    def test_message(self):
        model = user_models.UserQueryModel(
            id='test',
            submitter_id='submitter',
            created_on=self.YEAR_AGO,
            last_updated=self.YEAR_AGO
        )
        error = user_model_errors.ModelExpiringError(model)

        self.assertEqual(
            error.message,
            'ModelExpiringError in UserQueryModel(id=\'test\'): mark model '
            'as deleted when older than %s days' % (
                feconf.PERIOD_TO_MARK_MODELS_AS_DELETED.days))


class ModelIncorrectKeyErrorTests(AuditErrorsTestBase):

    def test_message(self):
        model = user_models.PendingDeletionRequestModel(
            id='test'
        )
        incorrect_keys = ['incorrect key']
        error = user_model_errors.ModelIncorrectKeyError(model, incorrect_keys)

        self.assertEqual(
            error.message,
            'ModelIncorrectKeyError in PendingDeletionRequestModel'
            '(id=\'test\'): contains keys %s are not allowed' %
            incorrect_keys)


class ModelIdRegexErrorTests(AuditErrorsTestBase):

    def test_message(self):
        model = base_models.BaseModel(
            id='?!"',
            created_on=self.YEAR_AGO,
            last_updated=self.NOW)
        error = user_model_errors.ModelIdRegexError(model, '[abc]{3}')

        self.assertEqual(
            error.message,
            'ModelIdRegexError in BaseModel(id=\'?!"\'): id does not '
            'match the expected regex=u\'[abc]{3}\'')


class DraftChangeListLastUpdatedNoneErrorTests(AuditErrorsTestBase):

    def test_message(self):
        draft_change_list = [{
            'cmd': 'edit_exploration_property',
            'property_name': 'objective',
            'new_value': 'the objective'
        }]
        model = user_models.ExplorationUserDataModel(
            id='123',
            user_id='test',
            exploration_id='exploration_id',
            draft_change_list=draft_change_list,
            draft_change_list_last_updated=None,
            created_on=self.YEAR_AGO,
            last_updated=self.YEAR_AGO
        )
        error = user_model_errors.DraftChangeListLastUpdatedNoneError(model)

        self.assertEqual(
            error.message,
            'DraftChangeListLastUpdatedNoneError in ExplorationUserDataModel'
            '(id=\'123\'): draft change list %s exists but draft change list '
            'last updated is None' % draft_change_list)


class DraftChangeListLastUpdatedInvalidErrorTests(AuditErrorsTestBase):

    def test_message(self):
        draft_change_list = [{
            'cmd': 'edit_exploration_property',
            'property_name': 'objective',
            'new_value': 'the objective'
        }]
        last_updated = self.NOW + datetime.timedelta(days=5)
        model = user_models.ExplorationUserDataModel(
            id='123',
            user_id='test',
            exploration_id='exploration_id',
            draft_change_list=draft_change_list,
            draft_change_list_last_updated=last_updated,
            created_on=self.YEAR_AGO,
            last_updated=self.NOW
        )
        error = user_model_errors.DraftChangeListLastUpdatedInvalidError(model)

        self.assertEqual(
            error.message,
            'DraftChangeListLastUpdatedInvalidError in '
            'ExplorationUserDataModel(id=\'123\'): draft change list last '
            'updated %s is greater than the time when job was run' %
            last_updated)
